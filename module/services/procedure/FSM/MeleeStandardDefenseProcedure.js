// module/services/procedure/FSM/MeleeStandardDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";

const config = Config.sr3e;

export default class MeleeStandardDefenseProcedure extends AbstractProcedure {
   constructor(defender, _item = null, args = {}) {
      super(defender, _item, args);
      ProcedureLock.assertEnter({
         ownerKey: `${this.constructor.name}:${caller?.id}`,
         priority: "advanced",
         onDenied: () => {},
      });
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
      return game?.i18n?.localize?.(config.button.defend) ?? "Defend";
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

try {
   AbstractProcedure.register?.("melee-standard", MeleeStandardDefenseProcedure);
} catch {}
