// module/services/procedure/FSM/MeleeProcedure.js
import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import MeleeService from "@families/MeleeService.js";

/**
 * Attacker procedure for melee.
 * - Builds a simple TN (base 4 + composer mods)
 * - Exports a responder UI with Standard / Full defense
 * - Provides strict contested rendering + resistance-prep just like FirearmProcedure
 */
export default class MeleeProcedure extends AbstractProcedure {
  #packet = null; // DamagePacket (snapshot)

  constructor(caller, item) {
    super(caller, item);
  }

  // Minimal flavor used by SR3ERoll when needed
  getFlavor() {
    const w = this.item?.name ?? "Melee";
    return `${w} Attack`;
  }
  getChatDescription() {
    const w = this.item?.name ?? "Melee";
    return `<div>${w}</div>`;
  }

  // Primary button label
  getPrimaryActionLabel() {
    const t = game?.i18n?.localize?.bind(game.i18n);
    if (this.hasTargets) return t?.("sr3e.button.challenge") ?? "Challenge!";
    const atk = t?.("sr3e.button.attack") ?? "Attack";
    const weapon = this.item?.name ?? "";
    return weapon ? `${atk} ${weapon}` : atk;
  }

  // --- precompute (optional) ---------------------------------------------------
  precompute({ defender = null, situational = {} } = {}) {
    try {
      const packet = MeleeService.planStrike({
        attacker: this.caller,
        defender,
        weapon: this.item,
        situational
      });
      this.#packet = packet;
    } catch {
      this.#packet = null; // safe: we will rebuild later if needed
    }
  }

  // ---------- main action (regular roll) ----------
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

      // Clean any local contests we opened
      const ids = this.contestIds;
      if (ids?.length) {
        for (const id of ids) OpposeRollService.expireContest(id);
        this.clearContests();
      }

      Hooks.callAll("actorSystemRecalculated", actor);
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
    } catch (err) {
      DEBUG && LOG.error("Melee challenge flow failed", [__FILE__, __LINE__, err]);
      ui.notifications.error(game.i18n.localize?.("sr3e.error.challengeFailed") ?? "Challenge failed");
      throw err;
    }
  }

  // ---------- defense guidance & responder UI ----------

  /** What the defender rolls against (UI labels & default TN hint). */
  getDefenseHint() {
    return {
      type: "skill",
      key: "melee",
      tnMod: 0,
      tnLabel: "Melee difficulty",
    };
  }

  /**
   * Melee responder UI: two explicit choices. The framework’s responder harness
   * will forward the pressed `data-responder` key to map which defense procedure to run.
   */
  async getResponderPromptHTML(exportCtx /*, { contest } */) {
    const ui = exportCtx?.next?.ui || {};
    const prompt = String(ui.prompt || "");
    const standard = String(ui.standard || "");
    const full = String(ui.full || "");
    if (!prompt || !standard || !full) {
      throw new Error("export.next.ui.{prompt,standard,full} are required for melee responder UI");
    }
    return `
      <div class="sr3e-responder-prompt">${prompt}</div>
      <div class="buttons-horizontal-distribution" role="group" aria-label="Melee defense choice">
        <button class="sr3e-response-button std"  data-responder="standard">${standard}</button>
        <button class="sr3e-response-button full" data-responder="full">${full}</button>
      </div>
    `;
  }

  /**
   * Build *defense* procedure from the choice.
   * The responder harness should pass a third arg { responderKey } with "standard" or "full".
   * If your harness doesn’t yet, you can also embed a tiny switch there to rewrite `next.kind`.
   */
  buildDefenseProcedure(exportCtx, { defender, contestId, responderKey = "standard" }) {
    const key = responderKey === "full" ? "melee-full" : "melee-standard";
    const Ctor = AbstractProcedure.getCtor(key);
    if (!Ctor) throw new Error(`No registered defense procedure for key="${key}"`);
    const baseArgs = exportCtx?.next?.args || {};
    return new Ctor(defender, null, { ...baseArgs, contestId });
  }

  // ---------- contested result rendering (strict) ----------
  async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
    const weaponName = this.item?.name || exportCtx?.weaponName || "Attack";

    const top = `
      <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
      <p><strong>${initiator.name}</strong> attacks <strong>${target.name}</strong> with <em>${weaponName}</em>.</p>
    `;

    const iSummary = SR3ERoll.renderVanilla(initiator, initiatorRoll);
    const tSummary = SR3ERoll.renderVanilla(target, targetRoll);
    const winner = netSuccesses > 0 ? initiator : target;

    const html = `
      ${top}
      <h4>${initiator.name}</h4>
      ${iSummary}
      <h4>${target.name}</h4>
      ${tSummary}
      <p><strong>${winner.name}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
    `;

    const resistancePrep = netSuccesses > 0 ? this.buildResistancePrep(exportCtx, { initiator, target }) : null;
    return { html, resistancePrep };
  }

  /**
   * Build resist-prep when attacker wins (pure snapshot).
   * For melee, we export a DamagePacket (packet) and let MeleeService build.
   */
  buildResistancePrep(exportCtx, { initiator, target }) {
    const packet =
      exportCtx?.damage /* already a packet */ ??
      this.#packet /* precomputed */ ??
      MeleeService.planStrike({ attacker: initiator, defender: target, weapon: this.item });

    const prep = MeleeService.prepareDamageResolution(target, { packet });
    prep.familyKey = "melee";
    prep.weaponId = exportCtx?.weaponId || this.item?.id || null;
    prep.weaponName = exportCtx?.weaponName || this.item?.name || "Attack";

    // In melee, resistance TN base is handled inside the build (Power − Impact armor etc.)
    // We keep tnMods empty here; armor is handled in the ResistanceEngine for melee.
    prep.tnMods = Array.isArray(prep.tnMods) ? prep.tnMods : [];

    return prep;
  }

  // ---------- contest export ----------
  exportForContest() {
    const weapon = this.item;
    const attacker = this.caller;

    const tnBase = Number(get(this.targetNumberStore) ?? 4);
    const tnMods = (get(this.modifiersArrayStore) ?? []).map((m) => ({
      id: m.id ?? null,
      name: m.name ?? "",
      value: Number(m.value) || 0,
    }));

    // snapshot a packet (optional)
    if (!this.#packet) {
      try {
        this.#packet = MeleeService.planStrike({ attacker, defender: null, weapon });
      } catch { /* ignore */ }
    }

    return {
      familyKey: "melee",
      weaponId: weapon?.id ?? null,
      weaponName: weapon?.name ?? "Attack",
      plan: null,
      damage: this.#packet ?? null, // DamagePacket
      tnBase,
      tnMods,

      // Responder step: choose defense type
      next: {
        kind: "melee-standard",  // default; UI may switch to "melee-full" via responderKey
        ui: {
          prompt: `${attacker?.name ?? "Attacker"} attacks with ${weapon?.name ?? "weapon"}. Choose defense:`,
          standard: "Standard Defense",
          full: "Full Defense",
        },
        args: {
          initiatorId: attacker?.id,
          weaponId: weapon?.id,
          weaponName: weapon?.name ?? "Attack",
        },
      },
    };
  }
}

// Register (if your AbstractProcedure exposes a register method; otherwise, do it in your registry file)
try { AbstractProcedure.register?.("melee", MeleeProcedure); } catch {}
