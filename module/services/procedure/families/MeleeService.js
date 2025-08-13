// module/services/procedure/families/MeleeService.js
import DirectiveRegistry from "@rules/DirectiveRegistry.js";
import DamagePacket from "@rules/DamagePacket.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";

export default class MeleeService {
   /**
    * Assemble a DamagePacket for a melee strike.
    * Expects: weapon.system.family === "melee"
    *           weapon.system.reach (int, default 0)
    *           weapon.system.damageType (e.g., "m-physical")
    *           weapon.system.damage (the "+X" in STR+X)
    */
   static planStrike({ attacker, defender, weapon, situational = {} }) {
      if (!attacker || !defender || !weapon) throw new Error("sr3e: planStrike missing actor/defender/weapon");

      let levelDelta = 0;
      const notes = ["melee"];

      const aReach = this.#num(weapon?.system?.reach) ?? 0;
      const dReach = this.#defenderReach(defender);
      const reachDiff = aReach - dReach;

      // Reach note
      if (reachDiff !== 0) {
         const mag = Math.abs(reachDiff);
         notes.push(`reach:${reachDiff > 0 ? `A+${mag}` : `D+${mag}`}`);
      }

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
         situational: { ...situational, reachDiff },
      });

      // Build DamagePacket
      const packet = this.#buildMeleePacket({ attacker, weapon, levelDelta, directives });

      return {
         levelDelta: packet.levelDelta,
         notes: [...(packet.notes ?? []), ...notes],
         packet,
      };
   }

   static prepareDamageResolution(defender, { packet, netAttackSuccesses = 0 } = {}) {
      if (!defender || !packet) throw new Error("sr3e: prepareDamageResolution missing defender/packet");
      return ResistanceEngine.build(defender, packet, netAttackSuccesses);
   }

   static resolveDamageOutcome(build, bodySuccesses = 0) {
      return ResistanceEngine.resolve(build, bodySuccesses);
   }

   // ----- helpers -----

   // For melee: Power = STR + weapon.system.damage (damage is the +X)
   static #computeMeleePower(attacker, weapon) {
      const s =
         this.#num(attacker?.system?.attributes?.strength?.total) ??
         this.#num(attacker?.system?.attributes?.strength?.value);
      if (s === null) throw new Error("sr3e: attacker Strength not found/finite for melee power calc");

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

   static #defenderReach(defender) {
      // Prefer an equipped melee weapon with reach; fallback 0
      const melee = defender?.items?.find?.((i) => i.type === "weapon" && this.#num(i?.system?.reach) > 0);
      return melee ? this.#num(melee.system.reach) : 0;
   }

   static #num(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
   }

   static getDefenseHintFromAttack(_initiatorRoll) {
      return { type: "skill", key: "melee", tnMod: 0, tnLabel: "Melee defense" };
   }
}
