import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import FirearmService from "@families/FirearmService.js";

export default class FirearmProcedure extends AbstractProcedure {
   #attackCtx = null; // { plan, damage, ammoId }

   constructor(caller, item) {
      super(caller, item);
   }

   /** Reset recoil tracking for this actor */
   resetRecoil() {
      FirearmService.resetAllRecoilForActor(this.caller?.id);
   }

   /** Ensure recoil mod row is kept in sync for the composer */
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
    * Precompute the attack plan + damage for this firearm before rolling.
    * Composer can call this when declaredRounds/ammo changes.
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

   /** After the contested roll completes, finalize firearm attack resolution */
   async onChallengeResolved({ roll, actor }) {
      // If precompute hasn't run, compute on-demand with conservative defaults
      if (!this.#attackCtx) {
         const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {});
         this.#attackCtx = { plan, damage, ammoId };
      }

      const weapon = this.item;
      const plan = this.#attackCtx?.plan;

      if (weapon && plan) {
         await FirearmService.onAttackResolved(actor, weapon, plan);
      }

      // Clear transient state after resolution
      this.#attackCtx = null;
   }
}
