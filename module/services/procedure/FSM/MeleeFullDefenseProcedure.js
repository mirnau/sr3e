// module/services/procedure/FSM/MeleeFullDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";

export default class MeleeFullDefenseProcedure extends AbstractProcedure {
   constructor(defender, _item = null, args = {}) {
      super(defender, _item);
      this.args = args || {};

      // Seed base dice from chosen basis or fallback to Strength
      const basis = this.args.basis || {};
      const key = String(basis.key || "strength");
      const a = defender?.system?.attributes?.[key];
      const seed = Number(basis.dice ?? a?.total ?? a?.value ?? 0) || 0;
      this.dice = Math.max(0, seed);

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

   // add below the class methods
   buildFormula(explodes = true) {
      // 1) base dice from the active basis or fallback to Strength
      const b = this.args?.basis || {};
      const key = String(b.key || "strength");
      const attr = this.caller?.system?.attributes?.[key];
      const attrVal = Number(attr?.total ?? attr?.value ?? 0) || 0;

      // prefer explicit basis.dice if composer supplied it; otherwise use attribute value
      const baseDice = Math.max(0, Math.floor(Number(b.dice ?? this.dice ?? attrVal) || 0));

      // 2) Full Defense initial test: no pool; karma is allowed as usual
      const karmaDice = Math.max(0, Math.floor(Number(this.karmaDice) || 0));
      const totalDice = baseDice + karmaDice;

      if (!Number.isFinite(totalDice) || totalDice <= 0) return "0d6";

      const base = `${totalDice}d6`;
      if (!explodes) return base;

      // Use the procedure’s final TN (your AbstractProcedure already clamps ≥2)
      const tn = Math.max(2, Number(this.finalTN()) || 2);
      return `${base}x${tn}`;
   }

   async execute({ OnClose } = {}) {
      OnClose?.();

      // Initial Full Defense test: no Combat Pool on this roll
      this.poolDice = 0;

      // If user reshaped UI and dice went to 0, re-seed from basis/attribute
      if ((this.dice | 0) <= 0) {
         const basis = this.args?.basis || {};
         const key = String(basis.key || "strength");
         const a = this.caller?.system?.attributes?.[key];
         const seed = Number(basis.dice ?? a?.total ?? a?.value ?? 0) || 0;
         this.dice = Math.max(0, seed);
      }

      const actor = this.caller;
      const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });

      // Reflect "no pool on this test" and keep attribute basis for transparency
      const basis = this.args?.basis || {};
      const opt = { ...(baseRoll.options || {}), pools: [] };
      if (!opt.skill && !opt.skillKey && !opt.attribute && !opt.attributeKey) {
         opt.attributeKey = String(basis.key || "strength");
         opt.isDefaulting = true;
         if (Number.isFinite(basis.dice)) opt.attributeDice = Number(basis.dice);
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
