import WeaponModePlanners from "@rules/WeaponModePlanners.js";
import DirectiveRegistry from "@rules/DirectiveRegistry.js";
import DamagePacket from "@rules/DamagePacket.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";
import RecoilTracker from "@rules/RecoilTracker.js";
import DefenseHint from "@common/DefenseHint.js";
import AmmoService from "@game/AmmoService.js";

export default class FirearmService {
  // ——— mode helpers ———
  static #weaponModes() {
    const m = CONFIG?.sr3e?.weaponMode;
    if (!m || typeof m !== "object") throw new Error("sr3e: CONFIG.sr3e.weaponMode missing");
    return Object.keys(m);
  }
  static #modeKey(w) {
    const mode = String(w?.system?.mode ?? "");
    const allowed = this.#weaponModes();
    if (!allowed.includes(mode)) throw new Error(`sr3e: Unknown weapon mode "${mode}"`);
    return mode;
  }
  static #isFirearmMode(m) {
    return m === "manual" || m === "semiauto" || m === "burst" || m === "fullauto";
  }
  static #isHeavy(w) { return !!w?.system?.isHeavy; }
  static #rc(w) { return Number(w?.system?.recoilComp ?? 0) || 0; }

  // ——— recoil (delegates) ———
  static inCombat() { return RecoilTracker.inCombat(); }
  static getPhase() { return RecoilTracker.getPhase(); }
  static resetRecoil(attackerId) { return RecoilTracker.resetRecoil(attackerId); }
  static resetAllRecoilForActor(attackerId) { return RecoilTracker.resetAllRecoilForActor(attackerId); }
  static hasRecoilContext(attackerId) { return RecoilTracker.hasRecoilContext(attackerId); }
  static getPhaseShots(attackerId) { return RecoilTracker.getPhaseShots(attackerId); }
  static bumpPhaseShots(attackerId, n) { return RecoilTracker.bumpPhaseShots(attackerId, n); }
  static setOOCWindowMs(ms) { return RecoilTracker.setOOCWindowMs(ms); }
  static getOOCShots(attackerId) { return RecoilTracker.getOOCShots(attackerId); }
  static bumpOOCShots(attackerId, n) { return RecoilTracker.bumpOOCShots(attackerId, n); }

  // ——— defense hint ———
  static getDefenseTNAdd(weapon) { return DefenseHint.getDefenseTNAdd(weapon); }
  static getDefenseTNLabel(weapon) { return DefenseHint.getDefenseTNLabel(weapon); }
  static getDefenseHintFromAttack(initiatorRoll) { return DefenseHint.fromInitiatorRoll(initiatorRoll); }

  // ——— planning ———
  static planFire({ weapon, mode, phaseShotsFired = 0, declaredRounds = null, ammoAvailable = null }) {
    const m = mode ?? this.#modeKey(weapon);
    const rc = this.#rc(weapon);
    const heavy = this.#isHeavy(weapon);

    // the firearm planners registered in @registry return:
    // { roundsFired, attackerTNMod, powerDelta, levelDelta, notes }
    const plan = WeaponModePlanners.plan({
      mode: m,
      context: { phaseShotsFired, rc, heavy, declaredRounds, ammoAvailable }
    });

    return { ...plan, mode: m };
  }

  static recoilModifierForComposer({ actor, caller, declaredRounds = 1, ammoAvailable = null }) {
    const itemId = caller?.item?.id ?? caller?.key;
    const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
    if (!weapon) return null;

    const m = this.#modeKey(weapon);
    const already = this.inCombat() ? this.getPhaseShots(actor?.id) : this.getOOCShots(actor?.id);

    const plan = this.planFire({
      weapon,
      mode: m,
      phaseShotsFired: already,
      declaredRounds,
      ammoAvailable,
    });

    return plan.attackerTNMod ? { id: "recoil", name: "Recoil", value: plan.attackerTNMod } : null;
  }

  // ——— attack orchestration ———
  static beginAttack(actor, weapon, { declaredRounds = 1, ammoAvailable = null, rangeBand = null } = {}) {
    const already = this.inCombat() ? this.getPhaseShots(actor?.id) : this.getOOCShots(actor?.id);
    const plan = this.planFire({ weapon, phaseShotsFired: already, declaredRounds, ammoAvailable });

    const ammo = AmmoService.getAttachedAmmo(actor, weapon);
    const directives = DirectiveRegistry.collect({ familyKey: "firearm", weapon, ammo, situational: { rangeBand } });
    const damage = DamagePacket.build({ weapon, plan, directives, rangeBand });

    return { plan, damage, ammoId: ammo?.id || "" };
  }

  static prepareDamageResolution(defender, { plan, damage, netAttackSuccesses = 0 } = {}) {
    return ResistanceEngine.build(defender, damage, netAttackSuccesses);
  }

  static resolveDamageOutcome(build, bodySuccesses = 0) {
    return ResistanceEngine.resolve(build, bodySuccesses);
  }

  static async onAttackResolved(actor, weapon, plan) {
    await AmmoService.consume(actor, weapon, Number(plan?.roundsFired ?? 1));
    const n = Number(plan?.roundsFired ?? 1);
    if (this.inCombat()) this.bumpPhaseShots(actor?.id, n);
    else this.bumpOOCShots(actor?.id, n);
    return true;
  }

  static bumpOnShot({ actor, weapon, declaredRounds = 1 }) {
    const m = this.#modeKey(weapon);
    if (!this.#isFirearmMode(m)) return;
    if (this.inCombat()) this.bumpPhaseShots(actor?.id, declaredRounds);
    else this.bumpOOCShots(actor?.id, declaredRounds);
  }

  // ——— ammo UX passthrough ———
  static findCompatibleAmmo(actor, weapon) { return AmmoService.findCompatibleAmmo(actor, weapon); }
  static async reloadWeapon(actor, weapon) { return AmmoService.reload(actor, weapon); }
  static async ejectMagazine(actor, weapon, opts = {}) { return AmmoService.eject(actor, weapon, opts); }
  static async consumeAmmo(actor, weapon, n = 1) { return AmmoService.consume(actor, weapon, n); }
}
