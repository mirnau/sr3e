// module/services/procedure/FSM/MeleeFullDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";

export default class MeleeFullDefenseProcedure extends AbstractProcedure {
   constructor(defender, _item = null, args = {}) {
      super(defender, _item, args);

      const { baseDice } = this.getEffectiveDice();
      this.dice = baseDice;

      // Full Defense "owns" input while active
      ProcedureLock.assertEnter({
         ownerKey: `${this.constructor.name}:${this.caller?.id}`,
         priority: "advanced",
         onDenied: () => {},
      });
   }

   getFlavor() {
      return "Melee Defense (Full)";
   }
   getChatDescription() {
      return `<div>Melee Defense (Full)</div>`;
   }
   getPrimaryActionLabel() {
      return game?.i18n?.localize?.("sr3e.button.fullDefend") ?? "Full Defense";
   }

   buildFormula(explodes = true) {
      const { totalDice } = this.getEffectiveDice({ includePool: false, includeKarma: true });
      if (!Number.isFinite(totalDice) || totalDice <= 0) return "0d6";

      const base = `${totalDice}d6`;
      if (!explodes) return base;

      const tn = Math.max(2, Number(this.finalTN()) || 2);
      return `${base}x${tn}`;
   }

   async execute({ OnClose } = {}) {
      OnClose?.();

      // Initial Full Defense test: no Combat Pool on this roll
      this.poolDice = 0;

      const actor = this.caller;
      const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });

      const basis = this.args?.basis || {};
      const opt = { ...(baseRoll.options || {}), pools: [] };
      if (basis.type === "attribute") {
         opt.attributeKey = String(basis.key || "strength");
         opt.isDefaulting = basis.isDefaulting ?? true;
         if (Number.isFinite(basis.dice)) opt.attributeDice = Number(basis.dice);
      } else if (basis.type === "skill") {
         opt.skill = { id: basis.id, name: basis.name };
         if (basis.specialization) opt.specialization = basis.specialization;
         if (Number.isFinite(basis.dice)) opt.skillDice = Number(basis.dice);
      }
      baseRoll.options = opt;

      const roll = await baseRoll.evaluate(this);
      await roll.waitForResolution();

      // Tag for resolver so we can run the Dodge step later
      roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: "full" };
      return roll;
   }

   onDestroy() {
      super.onDestroy?.();
      ProcedureLock.release(`${this.constructor.name}:${this.caller?.id}`);
   }
}
