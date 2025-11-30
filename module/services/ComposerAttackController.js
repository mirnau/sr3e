// @services/ComposerAttackController.js
// Pure helpers for the Roll Composer. No DOM.

import FirearmService from "@families/FirearmService.js";

/** number coercion */
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }

/** firearm detection: ammo or known firearm mode ONLY (ignore range bands) */
function hasAmmoSignals(sys) {
  if (!sys) return false;
  if (sys.ammunitionClass || sys.ammoId) return true;
  const inMag = num(sys?.ammo?.inMag ?? sys?.ammo);
  return inMag !== null;
}
function hasFirearmMode(sys) {
  const m = String(sys?.mode ?? "").toLowerCase();
  if (!m) return false;
  // align to your actual firearm modes
  return ["manual","semiauto","burst","fullauto","ss","sa","bf","fa"].includes(m);
}

/** public: classify by inference (no system.family) */
export function classifyWeapon(weapon) {
  if (!weapon || weapon.type !== "weapon") {
    return { isFirearm: false, isMelee: false, mode: "", ammoAvailable: null, declaredRounds: 1 };
  }
  const sys = weapon.system ?? {};
  const firearm = hasAmmoSignals(sys) || hasFirearmMode(sys);

  // Melee signal: numeric reach; otherwise default to melee if not firearm
  const reachN = num(sys.reach);
  const melee = reachN !== null || !firearm;

  const mode = String(sys.mode ?? "");
  const inMag = num(sys?.ammo?.inMag ?? sys?.ammo);
  const ammoAvailable = Number.isFinite(inMag) ? Math.max(0, inMag) : null;

  // initial declared rounds (only makes sense for firearms)
  let declaredRounds = 1;
  if (firearm) {
    if (mode === "burst") declaredRounds = ammoAvailable == null ? 3 : Math.min(3, ammoAvailable);
    else if (mode === "fullauto") {
      let base = 6;
      if (ammoAvailable != null) base = Math.min(base, ammoAvailable);
      declaredRounds = Math.max(3, Math.min(10, base));
    }
  }

  return { isFirearm: firearm, isMelee: melee, mode, ammoAvailable, declaredRounds };
}

/**
 * Recoil modifier row for the Composer.
 * Returns null for non-firearms (so the caller removes any “Recoil” row).
 */
export function computeRecoilRow({ actor, weapon, declaredRounds, ammoAvailable }) {
  const { isFirearm } = classifyWeapon(weapon);
  if (!isFirearm) return null; // ← never enter firearm code for melee

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
 * Precompute firearm plan/packet for preview.
 * Returns { plan:null, damage:null } for melee.
 */
export function precomputeFirearm({ actor, weapon, declaredRounds, ammoAvailable }) {
  const { isFirearm } = classifyWeapon(weapon);
  if (!isFirearm) return { plan: null, damage: null }; // ← guard

  const pre = FirearmService.beginAttack(actor, weapon, { declaredRounds, ammoAvailable });
  return { plan: pre.plan, damage: pre.damage };
}

/** recoil counters (for “Clear Recoil” button visibility) */
export function recoilState(actorId) {
  const inCombat = FirearmService.inCombat();
  const shots = inCombat ? FirearmService.getPhaseShots(actorId) : FirearmService.getOOCShots(actorId);
  return { inCombat, shots: Number(shots || 0) };
}

/** clear all recoil on the actor */
export function clearAllRecoilForActor(actorId) {
  if (!actorId) return;
  if (FirearmService.inCombat()) {
    FirearmService.bumpPhaseShots(actorId, -FirearmService.getPhaseShots(actorId));
  } else {
    FirearmService.bumpOOCShots(actorId, -FirearmService.getOOCShots(actorId));
  }
}
