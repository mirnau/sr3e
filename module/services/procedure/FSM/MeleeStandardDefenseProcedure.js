// module/services/procedure/FSM/MeleeStandardDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";

export default class MeleeStandardDefenseProcedure extends AbstractProcedure {
   constructor(defender, _item = null, args = {}) {
      super(defender, _item, args);

      const { baseDice } = this.getEffectiveDice();
      this.dice = baseDice;

      ProcedureLock.assertEnter({
         ownerKey: `${this.constructor.name}:${this.caller?.id}`,
         priority: "advanced",
         onDenied: () => {},
      });
   }

   buildFormula(explodes = true) {
      const { totalDice } = this.getEffectiveDice({ includePool: true, includeKarma: true });
      if (!Number.isFinite(totalDice) || totalDice <= 0) return "0d6";

      const base = `${totalDice}d6`;
      if (!explodes) return base;

      const tn = Math.max(2, Number(this.finalTN()) || 2);
      return `${base}x${tn}`;
   }

   onDestroy() {
      super.onDestroy?.();
      ProcedureLock.release(`${this.constructor.name}:${this.caller?.id}`);
   }

   getFlavor() {
      return "Melee Defense (Standard)";
   }
   getChatDescription() {
      return `<div>Melee Defense (Standard)</div>`;
   }
   getPrimaryActionLabel() {
      return game?.i18n?.localize?.("sr3e.button.defend") ?? "Defend";
   }

   // No pool limitations; defender can add their chosen Combat Pool
   async execute({ OnClose } = {}) {
      OnClose?.();
      const actor = this.caller;
      const formula = this.buildFormula(true);
      const roll = await SR3ERoll.create(formula, { actor }).evaluate(this);
      await roll.waitForResolution();

      // Tag the roll minimally so the resolver knows this was "standard"
      roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: "standard" };
      return roll;
   }
}
