// module/services/procedure/families/MeleeService.js
import DirectiveRegistry from "@rules/DirectiveRegistry.js";
import DamagePacket from "@rules/DamagePacket.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";

export default class MeleeService {
   /**
    * Compute damage packet for melee attack.
    * Expects: weapon.system.family === "melee"
    *           weapon.system.reach (int, default 0)
    *           weapon.system.damageType (e.g., "m-physical")
    *           weapon.system.damage (the "+X" in STR+X)
   */
   static planStrike({ attacker, defender, weapon, situational = {} }) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, MeleeService.planStrike.name]);
      let levelDelta = 0;
      const notes = ["melee"];

      // Called shot
      if (situational?.calledShot) {
         notes.push("called-shot");
         if (situational?.calledShotStages) levelDelta += Number(situational.calledShotStages) || 0;
      }

      // Collect melee directives
      const directives = DirectiveRegistry.collect({
         familyKey: "melee",
         weapon,
         ammo: null,
         situational,
      });

      // Build DamagePacket
      const packet = this.#buildMeleePacket({ attacker, weapon, levelDelta, directives });

      return {
         levelDelta: packet.levelDelta,
         notes: [...(packet.notes ?? []), ...notes],
         packet,
      };
   }

   static prepareDamageResolution(defender, { packet, netAttackSuccesses = 0, dodgeSuccesses = 0 } = {}) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, MeleeService.prepareDamageResolution.name]);
      return ResistanceEngine.build(defender, packet, netAttackSuccesses, dodgeSuccesses);
   }

   static resolveDamageOutcome(build, bodySuccesses = 0) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, MeleeService.resolveDamageOutcome.name]);
      return ResistanceEngine.resolve(build, bodySuccesses);
   }

   // ----- helpers -----

   // For melee: Power = STR + weapon.system.damage (damage is the +X)
   static #computeMeleePower(attacker, weapon) {
      const s =
         this.#num(attacker?.system?.attributes?.strength?.total) ??
         this.#num(attacker?.system?.attributes?.strength?.value);
      
      const add = this.#num(weapon?.system?.damage) ?? 0;
      return Math.max(0, s + add);
   }

   static #buildMeleePacket({ attacker, weapon, levelDelta = 0, directives = [] }) {
      const power = this.#computeMeleePower(attacker, weapon);
      const type = String(weapon?.system?.damageType ?? "m-physical");

      // Present a pseudo-weapon view whose damage is the computed power
      const pseudoWeapon = { system: { damage: power, damageType: type } };

      const merged = [{ k: "armor.use", v: "impact" }, ...directives];
      const plan = { powerDelta: 0, levelDelta, notes: ["melee"] };

      return DamagePacket.build({ weapon: pseudoWeapon, plan, directives: merged, rangeBand: null });
   }



   static #num(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
   }

   static getDefenseHintFromAttack(_initiatorRoll) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, MeleeService.getDefenseHintFromAttack.name]);
      return { type: "skill", key: "melee", tnMod: 0, tnLabel: "Melee defense" };
   }
}