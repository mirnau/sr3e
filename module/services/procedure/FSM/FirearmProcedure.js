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

      const top = `
    <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
    <p><strong>${initiator.name}</strong> attacks <strong>${target.name}</strong> with <em>${weaponName}</em>.</p>
  `;

      const attackBits = this.#attackContext(exportCtx);

      // Attacker: from weapon item (as you already had)
      const iSummary = this.#attackerSummaryFromItem(initiator, initiatorRoll);
      // Defender: from the actual roll options (skill/spec/defaulting OR attribute) + pools/karma
      const dSummary = this.#defenderSummaryFromRoll(target, targetRoll);

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

   // Replace your static #cap with an instance private helper:
   #cap(s) {
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
      if (mode) modeBits.push(`Mode: <b>${this.#cap(mode)}</b>`);
      if (Number.isFinite(rounds) && rounds > 1) modeBits.push(`Rounds: <b>${rounds}</b>`);

      const mods = Array.isArray(exportCtx?.tnMods) ? exportCtx.tnMods : [];
      const items = mods
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
   /** Defender summary reads ONLY what the defender actually rolled:
    *  - If a skill was chosen: "Skill: X, Specialization: Y[, Defaulting]"
    *  - Else if an attribute was chosen: "Attribute: Z"
    *  Then adds lines for Pools and Karma actually used.
    *  No lookups, no assumptions, no fallbacks.
    */
   #defenderSummaryFromRoll(_actor, rollJson) {
      const o = rollJson?.options ?? {};

      // --- main basis: skill/spec/defaulting OR attribute (whatever the user selected)
      // Accept common shapes coming from the composer (strings or small objects).
      const readName = (v) => {
         if (v == null) return null;
         if (typeof v === "string") return v;
         if (typeof v === "object") return v.name ?? v.label ?? v.key ?? null;
         return null;
      };

      const skillName = readName(o.skillKey ?? o.skill);
      const specName = readName(o.specialization ?? o.spec ?? o.specKey ?? o.specializationName);
      const attrName = readName(o.attributeKey ?? o.attribute);
      const isDefault = !!(o.isDefaulting ?? o.defaulting);

      const mainBits = [];
      if (skillName) {
         mainBits.push(`Skill: ${this.#cap(skillName)}`);
         if (specName) mainBits.push(`Specialization: ${this.#cap(specName)}`);
         if (isDefault) mainBits.push("Defaulting");
      } else if (attrName) {
         mainBits.push(`Attribute: ${this.#cap(attrName)}`);
      }

      // --- pools actually used on the roll (named fields and/or array form)
      const poolEntries = [];
      const pushPool = (label, n) => {
         const v = Number(n || 0);
         if (v > 0) poolEntries.push(`${label} ${v}`);
      };
      pushPool("Combat Pool", o.combatPoolDice);
      pushPool("Control Pool", o.controlPoolDice);
      pushPool("Hacking Pool", o.hackingPoolDice);
      pushPool("Astral Pool", o.astralPoolDice);
      pushPool("Spell Pool", o.spellPoolDice);

      if (Array.isArray(o.pools)) {
         for (const p of o.pools) {
            const name = typeof p?.name === "string" ? p.name : typeof p?.key === "string" ? p.key : null;
            const dice = Number(p?.dice ?? p?.value ?? 0);
            if (name && dice > 0) poolEntries.push(`${this.#cap(name)} ${dice}`);
         }
      }

      // --- karma actually used
      const karmaBits = [];
      const kd = Number(o.karmaDice || 0);
      if (kd > 0) karmaBits.push(`${kd} die`);
      const kr = Number(o.karmaRerolls || 0);
      if (kr > 0) karmaBits.push(`${kr} reroll${kr === 1 ? "" : "s"}`);

      // Build HTML (one line for basis; one line for pools/karma if present)
      const out = [];
      if (mainBits.length) out.push(`<p class="sr3e-roll-summary"><small>${mainBits.join(", ")}</small></p>`);

      const tailBits = [];
      if (poolEntries.length) tailBits.push(`Pools: ${poolEntries.join(", ")}`);
      if (karmaBits.length) tailBits.push(`Karma: ${karmaBits.join(", ")}`);
      if (tailBits.length) out.push(`<p class="sr3e-roll-summary"><small>${tailBits.join(" • ")}</small></p>`);

      return out.join("\n");
   }
}
