import { AbstractProcedure } from "./AbstractProcedure";

export class FirearmProcedure extends AbstractProcedure {
   constructor(caller, item) {
      super(caller, item);
   }

   get inCombat() {
      const c = game.combat;
      return !!c && (c.started === true || (c.combatants?.size ?? 0) > 0);
   }



   get targetNumber() {
      return this.#item.system.damage + this.#caller.system.attributes.strength;
   }

   primeRangeForWeapon(attackerToken, targetToken) {
      DEBUG &&
         (!attackerToken || !targetToken) &&
         LOG.error("Malformed call:", [(__FILE__, __LINE__, this.primeRangeForWeapon.name)]);
      DEBUG &&
         !this.modifiersArray &&
         LOG.error("Mo modifiers array has been set to the base class:", [
            (__FILE__, __LINE__, primeRangeForWeapon.name),
         ]);

      const rangeShiftLeft = 0;
      const raw = FirearmService.rangeModifierForComposer({
         actor,
         caller,
         attackerToken,
         targetToken,
         rangeShiftLeft,
      });

      DEBUG && !raw && LOG.error("Redudant call?:", [(__FILE__, __LINE__, this.primeRangeForWeapon.name)]);

      const name = raw.name;
      const rangeMod = { name, value, meta: raw.meta };

      const idx = modifiersArray.findIndex((m) => m.id === "range");
      if (idx >= 0 && modifiersArray[idx]?.meta?.userTouched) return;

      const mod = { ...rangeMod, id: "range", weaponId: weapon.id, source: "auto" };
      if (idx === -1) {
         modifiersArray = [...modifiersArray, mod];
      } else {
         const copy = [...modifiersArray];
         copy[idx] = { ...copy[idx], ...mod };
         modifiersArray = copy;
      }
      rangePrimedForWeaponId = weapon.id;
   }
}
