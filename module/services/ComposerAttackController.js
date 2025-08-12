// @services/ComposerAttackController.js
// Pure helpers for the Roll Composer. No UI, no stores, no fallbacks.
import FirearmService from "@families/FirearmService.js";

/**
 * Classify an item. We prefer item.system.family, but also accept ammo hints.
 */
export function classifyWeapon(weapon) {
  if (!weapon || weapon.type !== "weapon") throw new Error("sr3e: weapon required");

  const family = String(weapon?.system?.family ?? "").toLowerCase();
  const hasAmmoFlag = !!(weapon?.system?.ammunitionClass || weapon?.system?.ammoId || weapon?.system?.ammo);
  const isFirearm = family === "firearm" || hasAmmoFlag;

  const mode = String(weapon?.system?.mode ?? "");
  const inMag = Number(weapon?.system?.ammo?.inMag ?? weapon?.system?.ammo ?? NaN);
  const ammoAvailable = Number.isFinite(inMag) ? Math.max(0, inMag) : null;

  // Defaults only meaningful for firearms
  let declaredRounds = 1;
  if (isFirearm) {
    if (mode === "burst") {
      declaredRounds = ammoAvailable == null ? 3 : Math.min(3, ammoAvailable);
    } else if (mode === "fullauto") {
      let base = 6;
      if (ammoAvailable != null) base = Math.min(base, ammoAvailable);
      declaredRounds = Math.max(3, Math.min(10, base));
    }
  }

  // Bounds for the UI counter (only for firearm modes that need it)
  const roundsMin = mode === "fullauto" ? 3 : 1;
  const roundsCap = mode === "fullauto" ? 10 : 3;
  const roundsMax = isFirearm
    ? (mode === "burst"
        ? Math.min(3, ammoAvailable ?? 3)
        : mode === "fullauto"
        ? Math.min(roundsCap, ammoAvailable ?? roundsCap)
        : 1)
    : 1;

  return {
    isFirearm,
    family: isFirearm ? "firearm" : (family || "melee"),
    mode,
    ammoAvailable,
    declaredRounds,
    roundsMin,
    roundsMax,
  };
}

/**
 * Build the recoil modifier row for the Composer (or null if none).
 * Caller shape is constructed here (the Composer doesn’t need to know).
 */
export function computeRecoilRow({ actor, weapon, declaredRounds, ammoAvailable }) {
  const caller = { type: "item", key: weapon.id, item: { id: weapon.id } };
  return (
    FirearmService.recoilModifierForComposer({
      actor,
      caller,
      declaredRounds,
      ammoAvailable,
    }) || null
  );
}

/**
 * Precompute firearm plan/packet for preview (firearms only).
 */
export function precomputeFirearm({ actor, weapon, declaredRounds, ammoAvailable }) {
  const pre = FirearmService.beginAttack(actor, weapon, { declaredRounds, ammoAvailable });
  return { plan: pre.plan, damage: pre.damage };
}

/**
 * Recoil counters + reset helpers for the “Clear Recoil” button.
 */
export function recoilState(actorId) {
  const inCombat = FirearmService.inCombat();
  const shots = inCombat ? FirearmService.getPhaseShots(actorId) : FirearmService.getOOCShots(actorId);
  return { inCombat, shots: Number(shots || 0) };
}

export function clearAllRecoilForActor(actorId) {
  if (!actorId) return;
  if (FirearmService.inCombat()) {
    FirearmService.bumpPhaseShots(actorId, -FirearmService.getPhaseShots(actorId));
  } else {
    FirearmService.bumpOOCShots(actorId, -FirearmService.getOOCShots(actorId));
  }
}
