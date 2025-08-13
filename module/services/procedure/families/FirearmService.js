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
  static inCombat() {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.inCombat.name]);
    return RecoilTracker.inCombat();
  }
  static getPhase() {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getPhase.name]);
    return RecoilTracker.getPhase();
  }
  static resetRecoil(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.resetRecoil.name]);
    return RecoilTracker.resetRecoil(attackerId);
  }
  static resetAllRecoilForActor(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.resetAllRecoilForActor.name]);
    return RecoilTracker.resetAllRecoilForActor(attackerId);
  }
  static hasRecoilContext(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.hasRecoilContext.name]);
    return RecoilTracker.hasRecoilContext(attackerId);
  }
  static getPhaseShots(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getPhaseShots.name]);
    return RecoilTracker.getPhaseShots(attackerId);
  }
  static bumpPhaseShots(attackerId, n) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.bumpPhaseShots.name]);
    return RecoilTracker.bumpPhaseShots(attackerId, n);
  }
  static setOOCWindowMs(ms) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.setOOCWindowMs.name]);
    return RecoilTracker.setOOCWindowMs(ms);
  }
  static getOOCShots(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getOOCShots.name]);
    return RecoilTracker.getOOCShots(attackerId);
  }
  static bumpOOCShots(attackerId, n) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.bumpOOCShots.name]);
    return RecoilTracker.bumpOOCShots(attackerId, n);
  }

  // ——— defense hint ———
  static getDefenseTNAdd(weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getDefenseTNAdd.name]);
    return DefenseHint.getDefenseTNAdd(weapon);
  }
  static getDefenseTNLabel(weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getDefenseTNLabel.name]);
    return DefenseHint.getDefenseTNLabel(weapon);
  }
  static getDefenseHintFromAttack(initiatorRoll) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getDefenseHintFromAttack.name]);
    return DefenseHint.fromInitiatorRoll(initiatorRoll);
  }

  // ——— planning ———
  static planFire({ weapon, mode, phaseShotsFired = 0, declaredRounds = null, ammoAvailable = null }) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.planFire.name]);
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
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.recoilModifierForComposer.name]);
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
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.beginAttack.name]);
    const already = this.inCombat() ? this.getPhaseShots(actor?.id) : this.getOOCShots(actor?.id);
    const plan = this.planFire({ weapon, phaseShotsFired: already, declaredRounds, ammoAvailable });

    const ammo = AmmoService.getAttachedAmmo(actor, weapon);
    const directives = DirectiveRegistry.collect({ familyKey: "firearm", weapon, ammo, situational: { rangeBand } });
    const damage = DamagePacket.build({ weapon, plan, directives, rangeBand });

    return { plan, damage, ammoId: ammo?.id || "" };
  }

  static prepareDamageResolution(defender, { plan, damage, netAttackSuccesses = 0 } = {}) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.prepareDamageResolution.name]);
    return ResistanceEngine.build(defender, damage, netAttackSuccesses);
  }

  static resolveDamageOutcome(build, bodySuccesses = 0) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.resolveDamageOutcome.name]);
    return ResistanceEngine.resolve(build, bodySuccesses);
  }

  static async onAttackResolved(actor, weapon, plan) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.onAttackResolved.name]);
    await AmmoService.consume(actor, weapon, Number(plan?.roundsFired ?? 1));
    const n = Number(plan?.roundsFired ?? 1);
    if (this.inCombat()) this.bumpPhaseShots(actor?.id, n);
    else this.bumpOOCShots(actor?.id, n);
    return true;
  }

  static bumpOnShot({ actor, weapon, declaredRounds = 1 }) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.bumpOnShot.name]);
    const m = this.#modeKey(weapon);
    if (!this.#isFirearmMode(m)) return;
    if (this.inCombat()) this.bumpPhaseShots(actor?.id, declaredRounds);
    else this.bumpOOCShots(actor?.id, declaredRounds);
  }

// ——— ammo UX passthrough ———
static getAttachedAmmo(actor, weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.getAttachedAmmo.name]);
    return AmmoService.getAttachedAmmo(actor, weapon);
}
static findCompatibleAmmo(actor, weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.findCompatibleAmmo.name]);
    return AmmoService.findCompatibleAmmo(actor, weapon);
}
static async reloadWeapon(actor, weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.reloadWeapon.name]);
    return AmmoService.reload(actor, weapon);
}
static async ejectMagazine(actor, weapon, opts = {}) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.ejectMagazine.name]);
    return AmmoService.eject(actor, weapon, opts);
}
static async consumeAmmo(actor, weapon, n = 1) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.consumeAmmo.name]);
    return AmmoService.consume(actor, weapon, n);
}

}
