// AttributeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import { get } from "svelte/store";
import { localize } from "@services/utilities.js";

const config = CONFIG.sr3e;

export default class AttributeProcedure extends AbstractProcedure {
   static KIND = "attribute";
   static register() {
      AbstractProcedure.registerSubclass(this.KIND, this);
   }

   #attrKey = "strength";
   #opposedEnabled = false; // <- off by default

   /** Call this from the ADVANCED path when you want opposed behavior */
   setOpposedEnabled(v = true) {
      this.#opposedEnabled = !!v;
   }

   /** Only treat as “has targets” when advanced path opted in */
   get hasTargets() {
      return this.#opposedEnabled && super.hasTargets;
   }

   constructor(caller, _item = null, { attributeKey = "strength", title = null } = {}) {
      super(caller, null, { lockPriority: "simple" });
      this.#attrKey = String(attributeKey || "strength").toLowerCase();

      const label = title || (CONFIG?.sr3e?.attributes?.[this.#attrKey] ?? this.#attrKey);
      this.title = typeof label === "string" ? label : this.#attrKey;

      const a = caller?.system?.attributes?.[this.#attrKey];
      const rating = Number(a?.total ?? a?.value ?? 0) || 0;
      this.dice = Math.max(0, rating);
   }

   shouldSelfPublish() {
      return true;
   }
   getFlavor() {
      return `${this.title} Test`;
   }
   getChatDescription() {
      return `<div>${this.title} test</div>`;
   }

   async execute({ OnClose, CommitEffects } = {}) {
      OnClose?.();
      const actor = this.caller;

      const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });
      await this.onChallengeWillRoll?.({ baseRoll, actor });

      baseRoll.options ??= {};
      baseRoll.options.attributeKey = this.#attrKey;
      baseRoll.options.type = "attribute";

      const roll = await baseRoll.evaluate(this);
      await baseRoll.waitForResolution();
      await CommitEffects?.();
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
   }

   // Accept / Decline prompt shown to the defender
   async getResponderPromptHTML(exportCtx /*, { contest } */) {
      const key = String(
         this?.args?.attributeKey || exportCtx?.attributeKey || this.#attrKey || "attribute"
      ).toUpperCase();
      return `
      <div class="sr3e-responder-prompt">
        <div class="sr3e-responder-text">Opposed ${key} test</div>
        <div class="buttons-horizontal-distribution" role="group" aria-label="Response">
          <button class="sr3e-response-button yes" data-responder="yes">Accept</button>
          <button class="sr3e-response-button no"  data-responder="decline">Decline</button>
        </div>
      </div>`;
   }

   get isOpposed() {
      const hasTargets = (game.user?.targets?.size ?? 0) > 0;
      const tn = get(this.targetNumberStore); // composer sets this (default 4) only when opened
      return hasTargets && tn != null;
   }

   exportForContest() {
      return {
         familyKey: "attribute",
         attributeKey: this.#attrKey,
         next: { kind: AttributeProcedure.KIND }, // defender also rolls AttributeProcedure
      };
   }

   async fromContestExport(exportCtx, { contestId } = {}) {
      const k = String(exportCtx?.attributeKey || this.#attrKey || "strength").toLowerCase();
      this.#attrKey = k;

      const label = CONFIG?.sr3e?.attributes?.[k] ?? k;
      this.title = typeof label === "string" ? label : k;

      const a = this.caller?.system?.attributes?.[k];
      const rating = Number(a?.total ?? a?.value ?? 0) || 0;
      this.dice = Math.max(0, rating);

      // If we were called with a contestId, ensure the roll is returned to the initiator
      if (contestId) this.setContestIds([contestId]);

      // Defender is always a “response” roll → explicitly opt-in to opposed behavior
      this.setOpposedEnabled(true);
      // Most opposed attribute checks are open tests (no TN); if that’s your rule, uncomment:
      // this.targetNumberStore?.set?.(null);
   }

   #cap(s) {
      if (!s) return "";
      const t = String(s)
         .replace(/[_\-]+/g, " ")
         .trim();
      return t.charAt(0).toUpperCase() + t.slice(1);
   }


   #summarizeRollGeneric(rollJson) {
      const o = rollJson?.options || {};
      const readName = (v) => {
         if (v == null) return null;
         if (typeof v === "string") return v;
         if (typeof v === "object") return v.name ?? v.label ?? v.key ?? null;
         return null;
      };
      const skillName = readName(o.skillKey ?? o.skill);
      const specName = readName(o.specialization ?? o.spec ?? o.specKey ?? o.specializationName);
      const attrKey = readName(o.attributeKey ?? o.attribute);
      const attrName = attrKey ? (CONFIG?.sr3e?.attributes?.[attrKey] ?? attrKey) : null;
      const isDefault = !!(o.isDefaulting ?? o.defaulting);
      const bits = [];
      if (skillName) {
         bits.push(`Skill: ${this.#cap(skillName)}`);
         if (specName) bits.push(`Specialization: ${this.#cap(specName)}`);
         if (isDefault) bits.push("Defaulting");
      } else if (attrName) {
         bits.push(`Attribute: ${this.#cap(attrName)}`);
      }
      return bits.length
         ? `<p class="sr3e-roll-summary"><small>${bits.join(", ")}</small></p>`
         : "";
   }

   async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
      const initName = initiator?.name ?? "Attacker";
      const tgtName = target?.name ?? "Defender";
      const iHtml = SR3ERoll.renderRollOutcome(initiatorRoll);
      const tHtml = SR3ERoll.renderRollOutcome(targetRoll);
      const iSummary = this.#summarizeRollGeneric(initiatorRoll);
      const tSummary = this.#summarizeRollGeneric(targetRoll);
      const winner = netSuccesses > 0 ? initName : tgtName;
      return {
         html: `
      <p><strong>Contested roll between ${initName} and ${tgtName}</strong></p>
      <h4>${initName}</h4>${iSummary}${iHtml}
      <h4>${tgtName}</h4>${tSummary}${tHtml}
      <p><strong>${winner}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
    `,
         resistancePrep: null,
      };
   }

   toJSONExtra() {
      return { attributeKey: this.#attrKey };
   }
   async fromJSONExtra(extra) {
      if (extra?.attributeKey) this.#attrKey = String(extra.attributeKey).toLowerCase();
   }
}
