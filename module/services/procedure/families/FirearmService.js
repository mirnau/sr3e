import WeaponModePlanners from "@rules/WeaponModePlanners.js";
import DirectiveRegistry from "@rules/DirectiveRegistry.js";
import DamagePacket from "@rules/DamagePacket.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";
import RecoilTracker from "@rules/RecoilTracker.js";
import DefenseHint from "@common/DefenseHint.js";
import AmmoService from "@game/AmmoService.js";
import RangeService, { tnDeltaFromShort } from "@rules/RangeService.js";

export default class FirearmService {
   // ——— mode helpers ———
   static #weaponModes() {
      const m = Config?.sr3e?.weaponMode;
      if (!m || typeof m !== "object") throw new Error("sr3e: Config.sr3e.weaponMode missing");
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
   static #isHeavy(w) {
      return !!w?.system?.isHeavy;
   }
   static #rc(w) {
      return Number(w?.system?.recoilComp ?? 0) || 0;
   }

   // ——— recoil (delegates) ———
   static inCombat() {
      return RecoilTracker.inCombat();
   }
   static getPhase() {
      return RecoilTracker.getPhase();
   }
   static resetRecoil(attackerId) {
      return RecoilTracker.resetRecoil(attackerId);
   }
   static resetAllRecoilForActor(attackerId) {
      return RecoilTracker.resetAllRecoilForActor(attackerId);
   }
   static hasRecoilContext(attackerId) {
      return RecoilTracker.hasRecoilContext(attackerId);
   }
   static getPhaseShots(attackerId) {
      return RecoilTracker.getPhaseShots(attackerId);
   }
   static bumpPhaseShots(attackerId, n) {
      return RecoilTracker.bumpPhaseShots(attackerId, n);
   }
   static setOOCWindowMs(ms) {
      return RecoilTracker.setOOCWindowMs(ms);
   }
   static getOOCShots(attackerId) {
      return RecoilTracker.getOOCShots(attackerId);
   }
   static bumpOOCShots(attackerId, n) {
      return RecoilTracker.bumpOOCShots(attackerId, n);
   }

   // ——— defense hint ———
   static getDefenseTNAdd(weapon) {
      return DefenseHint.getDefenseTNAdd(weapon);
   }
   static getDefenseTNLabel(weapon) {
      return DefenseHint.getDefenseTNLabel(weapon);
   }
   static getDefenseHintFromAttack(initiatorRoll) {
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
         context: { phaseShotsFired, rc, heavy, declaredRounds, ammoAvailable },
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

   static rangeModifierForComposer({ actor, caller, attackerToken, targetToken, rangeShiftLeft = 0 }) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.rangeModifierForComposer.name]);
      const itemId = caller?.item?.id ?? caller?.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (!weapon) return null;

      try {
         const r = RangeService.resolve({ weapon, attackerToken, targetToken, shiftLeft: rangeShiftLeft });
         if (!r.band) {
            return { id: "range", name: "Range (Out of range)", value: 999, meta: { distance: r.distance } };
         }

         const delta = tnDeltaFromShort(r.band);
         if (!delta) return null; // short range → base 4 already shown
         const label = r.band[0].toUpperCase() + r.band.slice(1);
         return { id: "range", name: `Range (${label})`, value: delta, meta: { distance: r.distance } };
      } catch {
         return null; // no canvas / no tokens -> skip adding any range modifier
      }
   }

   // ——— attack orchestration ———
   static beginAttack(
      actor,
      weapon,
      {
         declaredRounds = 1,
         ammoAvailable = null,
         rangeBand = null,
         attackerToken = null,
         targetToken = null,
         rangeShiftLeft = 0,
      } = {}
   ) {
      const already = this.inCombat() ? this.getPhaseShots(actor?.id) : this.getOOCShots(actor?.id);
      const plan = this.planFire({ weapon, phaseShotsFired: already, declaredRounds, ammoAvailable });

      const ammo = AmmoService.getAttachedAmmo(actor, weapon);

      let resolvedBand = rangeBand;
      if (!resolvedBand && attackerToken && targetToken) {
         try {
            resolvedBand = RangeService.resolve({ weapon, attackerToken, targetToken, shiftLeft: rangeShiftLeft }).band;
         } catch {
            /* keep null */
         }
      }

      const directives = DirectiveRegistry.collect({
         familyKey: "firearm",
         weapon,
         ammo,
         situational: { rangeBand: resolvedBand },
      });

      const damage = DamagePacket.build({ weapon, plan, directives, rangeBand: resolvedBand });
      return { plan, damage, ammoId: ammo?.id || "" };
   }

   static prepareDamageResolution(defender, { plan, damage, netAttackSuccesses = 0, dodgeSuccesses = 0 } = {}) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, FirearmService.prepareDamageResolution.name]);
      return ResistanceEngine.build(defender, damage, netAttackSuccesses, dodgeSuccesses);
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

   static resistanceTNModsForTarget(target, { plan, damage, weapon } = {}) {
      const packet = damage || DamagePacket.build({ weapon, plan, directives: [], rangeBand: null });
      const build = ResistanceEngine.build(target, packet, 0);

      const eff = Number(build.armor.effective);
      const label = build.armor.armorType ? `Armor (${build.armor.armorType})` : "Armor";

      return eff === 0 ? [] : [{ id: "armor", name: label, value: -eff }];
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
