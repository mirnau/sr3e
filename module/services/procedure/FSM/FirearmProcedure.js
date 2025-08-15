import AbstractProcedure from "./AbstractProcedure.js";
import FirearmService from "../families/FirearmService.js";

export default class FirearmProcedure extends AbstractProcedure {
  constructor(caller, item) {
    super(caller, item);
  }

  /** Reset recoil tracking for this actor */
  resetRecoil() {
    FirearmService.resetAllRecoilForActor(this.caller?.id);
  }

  /**
   * Ensure recoil modifier is present/updated based on current state.
   * Passing null removes any existing recoil row.
   */
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
      return mod
        ? [...base, { ...mod, id, weaponId: this.item?.id, source: "auto" }]
        : base;
    });
  }

  /** Prime range modifier based on active tokens */
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

  /** Precompute plan & damage for the current firearm attack */
  precompute({ declaredRounds = 1, ammoAvailable = null } = {}) {
    const { plan, damage } = FirearmService.beginAttack(this.caller, this.item, {
      declaredRounds,
      ammoAvailable,
    });
    if (this.caller) {
      this.caller.firearmPlan = plan;
      this.caller.damagePacket = damage;
    }
  }
}
