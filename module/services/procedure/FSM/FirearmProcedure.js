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

   // Convenience alias for composer code
   get tnModifiers() {
      return this.modifiersArrayStore;
   }

   // ----- Minimal flavor used by SR3ERoll when needed
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

   // ---------- main action ----------
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

         // Clean up any local contests this procedure opened
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

   // Primary button label
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

   // ---------- defense guidance & responder UI ----------

   /** What the defender rolls against (UI labels & default TN hint). */
   getDefenseHint() {
      return {
         type: "attribute",
         key: "reaction",
         tnMod: 0,
         tnLabel: "Weapon difficulty",
      };
   }

   /** Custom responder prompt (must include yes/no buttons with the data-responder attribute). */
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
    * Build the *defense* procedure for the responder (e.g., Dodge), fully data-driven via registry.
    */
   buildDefenseProcedure(exportCtx, { defender, contestId }) {
      const kind = String(exportCtx?.next?.kind || "");
      const Ctor = AbstractProcedure.getCtor(kind);
      if (!Ctor) throw new Error(`No registered defense procedure for kind="${kind}"`);
      const baseArgs = exportCtx?.next?.args || {};
      return new Ctor(defender, null, { ...baseArgs, contestId });
   }

   // ---------- contested result rendering (STRICT, NO FALLBACKS) ----------

   async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
      const weaponName = this.item?.name || exportCtx?.weaponName || "Attack";

      // Top lines — exact order requested
      const top = `
      <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
      <p><strong>${initiator.name}</strong> attacks <strong>${target.name}</strong> with <em>${weaponName}</em>.</p>
    `;

      // Firearm context (Mode + Attack TN base + plain list of modifiers)
      const attackBits = this.#attackContext(exportCtx);

      // Per-side summaries (no actor name repetition, no "Dice:" line)
      const iSummary = this.#attackerSummaryFromItem(initiator, initiatorRoll);
      const dSummary = this.#defenderSummaryFromPools(target, targetRoll);

      // Standard roll cards
      const iHtml = SR3ERoll.renderVanilla(initiator, initiatorRoll);
      const tHtml = SR3ERoll.renderVanilla(target, targetRoll);

      const winner = netSuccesses > 0 ? initiator : target;

      const html = `
      ${top}
      ${attackBits}

      <h4>${initiator.name}</h4>
      ${iSummary}
      ${iHtml}

      <h4>${target.name}</h4>
      ${dSummary}
      ${tHtml}

      <p><strong>${winner.name}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
    `;

      // Attach resistance prep only if attacker won
      const resistancePrep = netSuccesses > 0 ? this.buildResistancePrep(exportCtx, { initiator, target }) : null;

      return { html, resistancePrep };
   }

   /**
    * Build the resist-prep for damage (called only when attacker wins).
    * Pure snapshot; OpposeRollService will prompt the defender.
    */
   buildResistancePrep(exportCtx, { initiator, target }) {
      const prep = FirearmService.prepareDamageResolution(target, {
         plan: exportCtx.plan,
         damage: exportCtx.damage,
      });

      // annotate for the resistance step
      prep.familyKey = "firearm";
      prep.weaponId = exportCtx.weaponId || this.item?.id || null;
      prep.weaponName = exportCtx.weaponName || this.item?.name || "Attack";
      if (exportCtx.tnBase != null) prep.tnBase = exportCtx.tnBase;
      if (Array.isArray(exportCtx.tnMods)) prep.tnMods = exportCtx.tnMods.slice();

      return prep;
   }

   // ---------- contest export (drives responder and resistance) ----------

   exportForContest() {
      const weapon = this.item;
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
            kind: "dodge",
            ui: {
               prompt: `${attacker?.name ?? "Attacker"} attacks with ${weapon?.name ?? "weapon"}. Dodge?`,
               yes: "Dodge",
               no: "Don’t Dodge",
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

   // ---------- helpers (strict, no fallbacks) ----------

   static #cap(s) {
      if (!s) return "";
      const t = String(s)
         .replace(/[_\-]+/g, " ")
         .trim();
      return t.charAt(0).toUpperCase() + t.slice(1);
   }

   /** Firearm context strictly from exportCtx: Mode + Attack TN base, and a plain list of modifiers. */
   #attackContext(exportCtx) {
      const plan = exportCtx?.plan || {};
      const mode = plan.modeName || null;
      const rounds = Number(plan.declaredRounds ?? 1);
      const tnBase = Number(exportCtx?.tnBase);

      const modeBits = [];
      if (mode) modeBits.push(`Mode: <b>${this.constructor.#cap(mode)}</b>`);
      if (Number.isFinite(rounds) && rounds > 1) modeBits.push(`Rounds: <b>${rounds}</b>`);

      const mods = Array.isArray(exportCtx?.tnMods) ? exportCtx.tnMods : [];
      const items = (exportCtx.tnMods ?? [])
         .map((m) => {
            const v = Number(m.value) || 0;
            const sign = v >= 0 ? "+" : "−";
            const abs = Math.abs(v);
            const name = m.name || (m.id ? String(m.id) : "");
            return `<li><span>${name}</span><b>${sign}${abs}</b></li>`;
         })
         .join("");

      return `
      <div class="sr3e-attack-context">
        ${modeBits.length ? `<p>${modeBits.join(" • ")}</p>` : ""}
        <p>Attack TN: <b>${tnBase}</b></p>
        ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
      </div>
    `;
   }

   /** Resolve skill + specialization strictly from the weapon’s linkedSkillId. */
   #resolveItemSkillAndSpec() {
      const sys = this.item?.system ?? {};
      const linked = String(sys.linkedSkillId ?? "").trim();
      if (!linked) return null;

      // Format: "<skillItemId>::<specializationIndex>"
      const [skillId, specIndexRaw] = linked.split("::");
      if (!skillId) return null;

      const skill = this.caller?.items?.get?.(skillId);
      if (!skill) return null;

      const type = skill.system?.skillType; // e.g. "active", "language", etc.
      const sub = type ? skill.system?.[`${type}Skill`] ?? {} : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];

      const specIndex = Number.parseInt(specIndexRaw, 10);
      const specObj = Number.isFinite(specIndex) ? specs[specIndex] : null;

      // Prefer the item’s visible name for skill; specializations often have .name
      const skillName = skill.name ?? (type ? String(type) : null);
      const specName = specObj?.name ?? (typeof specObj === "string" ? specObj : null);

      const isDefault = !!sys.isDefaulting;

      return { skillName, specName, isDefault };
   }

   /** Attacker summary reads ONLY the weapon’s linked skill + specialization + defaulting. */
   #attackerSummaryFromItem(_actor, _rollJson) {
      const info = this.#resolveItemSkillAndSpec();
      if (!info) return "";

      const parts = [];
      if (info.skillName) parts.push(`Skill: ${info.skillName}`);
      if (info.specName) parts.push(`Specialization: ${info.specName}`);
      if (info.isDefault) parts.push("Defaulting");

      return parts.length ? `<p class="sr3e-roll-summary"><small>${parts.join(", ")}</small></p>` : "";
   }

   /** Defender summary lists ONLY explicit pool dice present on the roll (+ karma dice/rerolls if set). */
   #defenderSummaryFromPools(_actor, rollJson) {
      const o = rollJson?.options ?? {};

      const entries = [];
      const push = (label, n) => {
         const v = Number(n || 0);
         if (v > 0) entries.push(`${label} ${v}`);
      };

      // Named pools you care about
      push("Combat Pool", o.combatPoolDice);
      push("Control Pool", o.controlPoolDice);
      push("Hacking Pool", o.hackingPoolDice);
      push("Astral Pool", o.astralPoolDice);
      push("Spell Pool", o.spellPoolDice);

      // Also support array form provided by the composer (still strict: only what the roll says)
      if (Array.isArray(o.pools)) {
         for (const p of o.pools) {
            const name = (p?.name || p?.key || "").trim();
            const dice = Number(p?.dice ?? p?.value ?? 0);
            if (name && dice > 0) entries.push(`${this.constructor.#cap(name)} ${dice}`);
         }
      }

      const karmaBits = [];
      const kd = Number(o.karmaDice || 0);
      if (kd > 0) karmaBits.push(`${kd} die`);
      const kr = Number(o.karmaRerolls || 0);
      if (kr > 0) karmaBits.push(`${kr} reroll${kr === 1 ? "" : "s"}`);

      const parts = [];
      if (entries.length) parts.push(`Pools: ${entries.join(", ")}`);
      if (karmaBits.length) parts.push(`Karma: ${karmaBits.join(", ")}`);

      return parts.length ? `<p class="sr3e-roll-summary"><small>${parts.join(" • ")}</small></p>` : "";
   }
}
