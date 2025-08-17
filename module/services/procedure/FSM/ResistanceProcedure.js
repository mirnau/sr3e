// module/services/procedure/FSM/ResistanceProcedure.js
import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";

export default class ResistanceProcedure extends AbstractProcedure {
   #prep;
   #defender;

   constructor(defender, _item = null, { prep } = {}) {
      super(defender, _item); // base class won’t set #caller because item is null
      this.#defender = defender; // keep our own pointer to the actor
      this.#prep = prep;

      // Title (cosmetic)
      this.title = this.getFlavor();

      // Base TN for this resistance step (must be prepared by the family)
      const baseTN = Number(prep.tnBase);
      this.targetNumberStore.set(baseTN);

      // Resistance-step TN modifiers (e.g., armor), provided by the family
      const rawMods = prep.tnMods;
      this.modifiersArrayStore.set(
         rawMods.map((m) => ({
            id: m.id ?? null,
            name: String(m.name ?? ""),
            value: Number(m.value) || 0,
            source: "auto",
         }))
      );

      // Base dice = Body
      const body =
         Number(defender.system?.attributes?.body?.value) ??
         Number(defender.system?.body?.value) ??
         Number(defender.system?.body);
      this.dice = Math.max(0, Number(body) || 0);
   }

   // OVERRIDE: always return our defender actor (base class didn’t set #caller)
   get caller() {
      return this.#defender;
   }

   get kind() {
      return "resistance";
   }
   get minDice() {
      return 1;
   }
   getCaller() {
      return { type: "attribute", key: "body", name: "Body" };
   }

   getFlavor() {
      const t = String(this.#prep.stagedStepBeforeResist || "").toUpperCase();
      const track = String(this.#prep.trackKey || "");
      const w = this.#prep.weaponName || "Attack";
      return `Damage Resistance — ${w} (${track}${t ? `, ${t}` : ""})`;
   }

   async onChallengeWillRoll({ baseRoll, actor }) {
      await super.onChallengeWillRoll?.({ baseRoll, actor });
      baseRoll.options = baseRoll.options || {};
      baseRoll.options.attribute = { key: "body", name: "Body" };

      const tnBase = Number(get(this.targetNumberStore));
      const tnMods = (get(this.modifiersArrayStore) || []).map((m) => ({
         id: m.id ?? null,
         name: m.name ?? "",
         value: Number(m.value) || 0,
      }));
      baseRoll.options.tnBase = tnBase;
      baseRoll.options.tnMods = tnMods;
      baseRoll.options.targetNumber = this.finalTN({ floor: 2 });
   }

   getPrimaryActionLabel() {
      const t = game?.i18n?.localize?.bind(game.i18n);
      return t?.("sr3e.button.resist") ?? "Resist";
   }

   finalTN({ floor = 2 } = {}) {
      const base = Number(get(this.targetNumberStore));
      const mods = get(this.modifiersArrayStore) || [];
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      return Math.max(floor, base + sum);
   }

   getChatDescription() {
      const base = Number(get(this.targetNumberStore));
      const mods = get(this.modifiersArrayStore) || [];
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      const finalTN = Math.max(2, base + sum);
      const items = mods
         .map((m) => {
            const v = Number(m.value) || 0;
            const sign = v >= 0 ? "+" : "−";
            const abs = Math.abs(v);
            return `<li><span>${m.name}</span><b>${sign}${abs}</b></li>`;
         })
         .join("");
      return `
      <div class="sr3e-tn-breakdown">
        <p>Resistance TN: <b>${finalTN}</b> <small>(base ${base}${
         sum ? (sum > 0 ? ` + ${sum}` : ` − ${Math.abs(sum)}`) : ""
      })</small></p>
        ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
      </div>`;
   }

   async execute({ OnClose, CommitEffects } = {}) {
      OnClose?.();

      const actor = this.caller;
      const formula = this.buildFormula(true);
      const baseRoll = SR3ERoll.create(formula, { actor });

      await this.onChallengeWillRoll?.({ baseRoll, actor });

      const roll = await baseRoll.evaluate(this);
      await baseRoll.waitForResolution();

      await CommitEffects?.();
      Hooks.callAll("actorSystemRecalculated", actor);

      await this.onChallengeResolved?.({ roll, actor });
      return roll;
   }

   async onChallengeResolved({ roll, actor }) {
      await OpposeRollService.resolveDamageResistanceFromRoll({
         defenderId: actor.id,
         weaponId: this.#prep.weaponId,
         prep: this.#prep,
         rollData: roll.toJSON(),
      });
   }

   exportForContest() {
      return {
         familyKey: this.#prep.familyKey || null,
         weaponId: this.#prep.weaponId || null,
         weaponName: this.#prep.weaponName || "Attack",
      };
   }

   toJSON() {
      return { kind: this.kind, prep: this.#prep };
   }

   static async fromJSON(json) {
      return new ResistanceProcedure(null, null, { prep: json.prep });
   }
}
