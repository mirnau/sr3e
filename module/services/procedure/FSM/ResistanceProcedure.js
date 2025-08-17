// ResistanceProcedure.js
import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";

export default class ResistanceProcedure extends AbstractProcedure {
   #prep;

   constructor(defender, _item = null, { prep } = {}) {
      super(defender, _item);
      this.#prep = prep;

      // Title
      this.title = this.getFlavor();

      // Base TN and mods — assume provided by prep (no fallbacks)
      const baseTN = Number(prep.tnBase);
      this.targetNumberStore.set(baseTN);

      const rawMods = prep.tnMods; // must be an array upstream
      this.modifiersArrayStore.set(
         rawMods.map((m) => ({
            id: m.id ?? null,
            name: String(m.name ?? ""),
            value: Number(m.value) || 0,
            source: "auto",
         }))
      );

      // Base dice (Body)
      const body =
         Number(defender?.system?.attributes?.body?.value) ??
         Number(defender?.system?.body?.value) ??
         Number(defender?.system?.body) ??
         0;
      this.dice = Math.max(0, Number(body) || 0);
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
      const t = String(this.#prep?.stagedStepBeforeResist || "").toUpperCase();
      const track = String(this.#prep?.trackKey || "");
      const w = this.#prep?.weaponName || "Attack";
      return `Damage Resistance — ${w} (${track}${t ? `, ${t}` : ""})`;
   }

   // Ensure the generic renderer gets the TN snapshot for THIS step
   async onChallengeWillRoll({ baseRoll, actor }) {
      await super.onChallengeWillRoll?.({ baseRoll, actor });
      baseRoll.options = baseRoll.options || {};
      baseRoll.options.attribute = { key: "body", name: "Body" };

      const tnBase = Number(get(this.targetNumberStore) ?? 4);
      const tnMods = (get(this.modifiersArrayStore) ?? []).map((m) => ({
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

   // Use the stores (not prep) so it reflects the AP base you set above + mods
   finalTN({ floor = 2 } = {}) {
      const base = Number(get(this.targetNumberStore) ?? 4);
      const mods = get(this.modifiersArrayStore) ?? [];
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      return Math.max(floor, base + sum);
   }

   // Optional: also switch the description to read from the stores
   getChatDescription() {
      const base = Number(get(this.targetNumberStore) ?? 4);
      const mods = get(this.modifiersArrayStore) ?? [];
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
      try {
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
      } catch (err) {
         DEBUG && LOG.error("Resistance flow failed", [__FILE__, __LINE__, err]);
         ui.notifications.error(game.i18n.localize?.("sr3e.error.challengeFailed") ?? "Challenge failed");
         throw err;
      }
   }

   exportForContest() {
      return {
         familyKey: this.#prep?.familyKey || null,
         weaponId: this.#prep?.weaponId || null,
         weaponName: this.#prep?.weaponName || "Attack",
      };
   }

   toJSON() {
      return { kind: this.kind, prep: this.#prep };
   }
   static async fromJSON(json) {
      if (!json?.prep) throw new Error("sr3e: ResistanceProcedure.fromJSON missing prep");
      return new ResistanceProcedure(null, null, { prep: json.prep });
   }
}
