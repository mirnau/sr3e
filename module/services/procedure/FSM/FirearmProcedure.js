import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import FirearmService from "@families/FirearmService.js";

export default class FirearmProcedure extends AbstractProcedure {
  #attackCtx = null; // { plan, damage, ammoId }

  constructor(caller, item) {
    super(caller, item);
  }

  // Alias: you were doing tnModifiers.update(...) earlier
  get tnModifiers() {
    return this.modifiersArrayStore;
  }

  // ----- nice bits for SR3ERoll.renderVanillaFromProcedure
  getFlavor() {
    const w = this.item?.name ?? "Firearm";
    return `${w} Attack`;
  }
  getChatDescription() {
    const w = this.item?.name ?? "Firearm";
    return `<div>${w}</div>`;
  }

  /** Reset recoil tracking for this actor */
  resetRecoil() {
    FirearmService.resetAllRecoilForActor(this.caller?.id);
  }

  /** Keep recoil row in sync in the composer */
  syncRecoil({ declaredRounds = 1, ammoAvailable = null } = {}) {
    const mod = FirearmService.recoilModifierForComposer({
      actor: this.caller,
      caller: { item: this.item },
      declaredRounds,
      ammoAvailable,
    });
    const id = "recoil";
    this.tnModifiers.update((arr = []) => {
      const base = arr.filter((m) => m.id !== id);
      return mod ? [...base, { ...mod, id, weaponId: this.item?.id, source: "auto" }] : base;
    });
  }

  /** Add/refresh range mod row in the composer */
  primeRangeForWeapon(attackerToken, targetToken, rangeShiftLeft = 0) {
    const mod = FirearmService.rangeModifierForComposer({
      actor: this.caller,
      caller: { item: this.item },
      attackerToken,
      targetToken,
      rangeShiftLeft,
    });
    if (!mod) return;
    this.upsertMod({ ...mod, weaponId: this.item?.id, source: "auto" });
  }

  /**
   * Precompute plan + damage so exportForContest has a clean snapshot.
   */
  precompute({
    declaredRounds = 1,
    ammoAvailable = null,
    attackerToken = null,
    targetToken = null,
    rangeShiftLeft = 0,
  } = {}) {
    const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {
      declaredRounds,
      ammoAvailable,
      attackerToken,
      targetToken,
      rangeShiftLeft,
    });
    this.#attackCtx = { plan, damage, ammoId };
  }

  async execute({ OnClose, CommitEffects } = {}) {
    try {
      OnClose?.();

      const actor = this.caller;
      const formula = this.buildFormula(true);
      const baseRoll = SR3ERoll.create(formula, { actor });

      await this.onChallengeWillRoll?.({ baseRoll, actor });

      const roll = await baseRoll.evaluate(this);
      await baseRoll.waitForResolution();

      await CommitEffects?.();

      const ids = this.contestIds;
      if (ids?.length) {
        for (const id of ids) OpposeRollService.expireContest(id);
        this.clearContests();
      }

      Hooks.callAll("actorSystemRecalculated", actor);
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
    } catch (err) {
      DEBUG && LOG.error("Challenge flow failed", [__FILE__, __LINE__, err]);
      ui.notifications.error(game.i18n.localize?.("sr3e.error.challengeFailed") ?? "Challenge failed");
      throw err;
    }
  }

  // ----- Composer primary button label
  getPrimaryActionLabel() {
    const t = game?.i18n?.localize?.bind(game.i18n);
    if (this.hasTargets) return t?.("sr3e.button.challenge") ?? "Challenge!";
    const fire = t?.("sr3e.button.fire") ?? "Fire";
    const weapon = this.item?.name ?? "";
    return weapon ? `${fire} ${weapon}` : fire;
  }

  /** Finalize firearm attack bookkeeping after the challenge resolves. */
  async onChallengeResolved({ roll, actor }) {
    if (!this.#attackCtx) {
      const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {});
      this.#attackCtx = { plan, damage, ammoId };
    }
    const weapon = this.item;
    const plan = this.#attackCtx?.plan;
    if (weapon && plan) await FirearmService.onAttackResolved(actor, weapon, plan);
    this.#attackCtx = null;
  }

  // ---------- defense guidance & opposed export ----------

  /** What the defender rolls against (UI labels & default TN hint). */
  getDefenseHint() {
    return {
      type: "attribute",
      key: "reaction",
      tnMod: 0,
      tnLabel: "Weapon difficulty",
    };
  }

  /**
   * Provide the responder UI HTML (used by addOpposedResponseButton).
   * Uses exportCtx.next.ui.{prompt,yes,no} and returns a Yes/No block.
   */
  async getResponderPromptHTML(exportCtx /*, { contest } */) {
    const ui = exportCtx?.next?.ui || {};
    const prompt = String(ui.prompt || "");
    const yes = String(ui.yes || "");
    const no = String(ui.no || "");
    if (!prompt || !yes || !no) {
      throw new Error("export.next.ui.{prompt,yes,no} are required for responder UI");
    }
    return `
      <div class="sr3e-responder-prompt">${prompt}</div>
      <div class="buttons-horizontal-distribution" role="group" aria-label="Defense choice">
        <button class="sr3e-response-button yes" data-responder="yes">${yes}</button>
        <button class="sr3e-response-button no"  data-responder="no">${no}</button>
      </div>
    `;
  }

  /**
   * Build the *defense* procedure for the responder (e.g., Dodge).
   * Uses the subclass registry so this stays data-driven.
   */
  buildDefenseProcedure(exportCtx, { defender, contestId }) {
    const kind = String(exportCtx?.next?.kind || "");
    const Ctor = AbstractProcedure.getCtor(kind);
    if (!Ctor) throw new Error(`No registered defense procedure for kind="${kind}"`);
    const baseArgs = exportCtx?.next?.args || {};
    return new Ctor(defender, null, { ...baseArgs, contestId });
  }

  /**
   * Firearm-flavored contested outcome. We can wrap the base HTML
   * and also decide whether to attach a resistance prep here.
   */
  async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
    const base = await super.renderContestOutcome(exportCtx, {
      initiator, target, initiatorRoll, targetRoll, netSuccesses,
    });

    const weaponName = exportCtx?.weaponName || this.item?.name || "Attack";
    const header = `
      <p><strong>${initiator?.name}</strong> attacks <strong>${target?.name}</strong> with <em>${weaponName}</em>.</p>
    `;

    // If attacker wins, we can return the resistance prep directly here.
    const resistancePrep = netSuccesses > 0
      ? this.buildResistancePrep(exportCtx, { initiator, target })
      : null;

    return {
      html: `${header}${base.html}`,
      resistancePrep,
    };
  }

  /**
   * Construct the resistance-prep object using the export snapshot.
   * Called only when the attacker wins.
   */
  buildResistancePrep(exportCtx, { initiator, target }) {
    if (exportCtx?.familyKey !== "firearm") return null;

    const prep = FirearmService.prepareDamageResolution(target, {
      plan: exportCtx.plan,
      damage: exportCtx.damage,
    });

    // annotate for the resistance step
    prep.familyKey  = "firearm";
    prep.weaponId   = exportCtx.weaponId || null;
    prep.weaponName = exportCtx.weaponName || "Attack";
    if (exportCtx.tnBase != null) prep.tnBase = exportCtx.tnBase;
    if (Array.isArray(exportCtx.tnMods)) prep.tnMods = exportCtx.tnMods.slice();

    return prep;
  }

  /**
   * Single source of truth shipped to OpposeRollService.startProcedure().
   * Includes the attack snapshot + the “next” step (Dodge) spec.
   */
  exportForContest() {
    const weapon   = this.item;
    const attacker = this.caller;

    const tnBase = Number(get(this.targetNumberStore) ?? 4);
    const tnMods = (get(this.modifiersArrayStore) ?? []).map((m) => ({
      id: m.id ?? null,
      name: m.name ?? "",
      value: Number(m.value) || 0,
    }));

    if (!this.#attackCtx) {
      const { plan, damage, ammoId } = FirearmService.beginAttack(attacker, weapon, {});
      this.#attackCtx = { plan, damage, ammoId };
    }

    const { tnMod, tnLabel } = this.getDefenseHint();

    return {
      familyKey: "firearm",
      weaponId: weapon?.id ?? null,
      weaponName: weapon?.name ?? "Attack",
      plan: this.#attackCtx?.plan ?? null,
      damage: this.#attackCtx?.damage ?? null,
      tnBase,
      tnMods,

      next: {
        kind: "dodge", // must be registered in init: AbstractProcedure.registerSubclass("dodge", DodgeProcedure)
        ui: {
          prompt: `${attacker?.name ?? "Attacker"} attacks with ${weapon?.name ?? "weapon"}. Dodge?`,
          yes: "Dodge",
          no:  "Don’t Dodge",
        },
        args: {
          initiatorId: attacker?.id,
          weaponId: weapon?.id,
          weaponName: weapon?.name ?? "Attack",
          defenseTNMod: tnMod,
          defenseTNLabel: tnLabel,
        },
      },
    };
  }
}
