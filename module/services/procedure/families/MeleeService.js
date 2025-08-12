// module/services/procedure/families/BladedWeaponService.js
import DirectiveRegistry from "@rules/DirectiveRegistry.js";
import DamagePacket from "@rules/DamagePacket.js";
import ResistanceEngine from "@rules/ResistanceEngine.js";

/**
 * Bladed/Melee orchestration:
 * - No ammo/recoil/range. Focuses on TN math + packet assembly.
 * - Default armorUse: "impact".
 * - Power: STR + weapon bonus (expects weapon.system.powerAdd).
 * - Damage type: from weapon (e.g., "m" | "s" | "d" + optional "stun"/"physical" suffix).
 *
 * Conventions assumed in data (adjust to your models as needed):
 * - Actor Strength: actor.system.attributes.strength.value (or .total).
 * - Weapon reach: weapon.system.reach (integer).
 * - Weapon power bonus: weapon.system.powerAdd (integer).
 * - Weapon base damage step/type: weapon.system.damageType (e.g., "m-physical").
 * - Situational: { calledShot?: boolean, tnAdd?: number, levelDelta?: number, positionTNAdd?: number }
 */
export default class MeleeService {
  // ——— planning ———

  /**
   * Compute attacker & defender TN adjustments driven by reach + situational flags.
   * SR3e Reach rule (summary): higher reach helps the character with the longer weapon and penalizes the other.
   * We encode this in a symmetric pair so UIs can hint both sides if desired.
   */
  static planStrike({ attacker, defender, weapon, situational = {} }) {
    if (!attacker || !defender || !weapon) throw new Error("sr3e: planStrike missing actor/defender/weapon");

    const aReach = Number(weapon?.system?.reach ?? 0) || 0;
    const dReach = Number(this.#defenderReach(defender) ?? 0) || 0; // see note below
    const reachDiff = aReach - dReach;

    // Base TN for SR3 melee = 4; we only return deltas here.
    let attackerTNAdd = 0;
    let defenderTNAdd = 0;
    let levelDelta = 0;
    const notes = ["melee"];

    // Reach: +diff to the disadvantaged side, -diff to the advantaged side
    if (reachDiff !== 0) {
      attackerTNAdd += reachDiff > 0 ? -Math.abs(reachDiff) : Math.abs(reachDiff);
      defenderTNAdd += reachDiff > 0 ? Math.abs(reachDiff) : -Math.abs(reachDiff);
      notes.push(`reach ${reachDiff > 0 ? `A+${reachDiff}` : `D+${-reachDiff}`}`);
    }

    // Situational TN adds (e.g., superior position, prone target, wounds, etc.)—caller computes these.
    if (Number.isFinite(situational?.tnAdd)) attackerTNAdd += Number(situational.tnAdd);

    // Called Shot: +4 TN; commonly used to stage up damage or hit sub-targets.
    if (situational?.calledShot) {
      attackerTNAdd += 4;
      levelDelta += 1; // If you use an alternate rule, remove/adjust this.
      notes.push("called-shot");
    }

    // Optional position-based TN add (keep separate from generic tnAdd if you want to show labels)
    if (Number.isFinite(situational?.positionTNAdd)) attackerTNAdd += Number(situational.positionTNAdd);

    // Let directives post-process (poisons, weapon quality, adept powers, etc.)
    // Family key "bladed" so you can register melee modifiers cleanly.
    const directives = DirectiveRegistry.collect({
      familyKey: "bladed",
      weapon,
      ammo: null,
      situational: { ...situational, reachDiff },
    });

    // Directive keys supported (same as DamagePacket):
    //   damage.powerAdd | damage.levelDelta | damage.type
    //   attack.tnAdd    | resist.tnAdd
    //   armor.use       | armor.mult.impact / armor.mult.ballistic
    //   special.*       → notes
    // We fold those into a DamagePacket; for melee we set armor.use to "impact" by default.
    const packet = this.#buildMeleePacket({ attacker, weapon, levelDelta, directives });

    // attack.tnAdd from directives contributes to attackerTNAdd; resist.tnAdd stays in packet
    attackerTNAdd += Number(packet.attackTNAdd || 0);

    return {
      attackerTNAdd,
      defenderTNAdd,
      levelDelta: packet.levelDelta, // already merged with situational
      notes: [...(packet.notes ?? [])],
      packet, // pass-through for resolution
    };
  }

  /**
   * Assemble a melee DamagePacket using DamagePacket.build to keep parity with firearms.
   * Forces armorUse: "impact" unless a directive overrides it.
   */
  static #buildMeleePacket({ attacker, weapon, levelDelta = 0, directives = [] }) {
    const power = this.#computeMeleePower(attacker, weapon);
    const type = String(weapon?.system?.damageType ?? "m-physical");

    // We fake a "weapon-like" object so DamagePacket can do its normal work.
    const pseudoWeapon = {
      system: {
        damage: power,          // numeric power (STR + bonus)
        damageType: type,       // e.g., "m-physical" | "s-physical" | "m-stun"
      },
    };

    // Seed a directive to default armor.use to Impact for melee unless caller/directive overrides.
    const merged = [{ k: "armor.use", v: "impact" }, ...directives];

    // No range plan in melee; provide a minimal plan object for level/power adjustments (typically none).
    const plan = { powerDelta: 0, levelDelta, notes: ["melee"] };

    return DamagePacket.build({ weapon: pseudoWeapon, plan, directives: merged, rangeBand: null });
  }

  // ——— resistance ———

  static prepareDamageResolution(defender, { packet, netAttackSuccesses = 0 } = {}) {
    if (!defender || !packet) throw new Error("sr3e: prepareDamageResolution missing defender/packet");
    return ResistanceEngine.build(defender, packet, netAttackSuccesses);
  }

  static resolveDamageOutcome(build, bodySuccesses = 0) {
    return ResistanceEngine.resolve(build, bodySuccesses);
  }

  // ——— helpers ———

  static #computeMeleePower(attacker, weapon) {
    // Try common strength paths; fail fast if not found—keep it explicit.
    const s =
      Number(attacker?.system?.attributes?.strength?.total) ||
      Number(attacker?.system?.attributes?.strength?.value);
    if (!Number.isFinite(s)) throw new Error("sr3e: attacker Strength not found/finite for melee power calc");

    const add = Number(weapon?.system?.powerAdd ?? 0) || 0;
    const p = Math.max(0, s + add);
    return p;
  }

  /**
   * Defender reach source:
   *  - If defender wields a melee weapon, prefer its reach; otherwise 0.
   *  - If you track "active melee item" on the actor, swap this to your accessor.
   */
  static #defenderReach(defender) {
    const melee = defender?.items?.find?.((i) => i.type === "weapon" && Number(i?.system?.reach ?? 0) > 0);
    return melee ? Number(melee.system.reach) : 0;
  }

  // Kept for parity with FirearmService — if your OpposeRollService wants a hint.
  // For melee, both sides usually roll the relevant melee skill at TN 4 ± mods.
  static getDefenseHintFromAttack(_initiatorRoll) {
    return { type: "skill", key: "melee", tnMod: 0, tnLabel: "Melee defense" };
  }
}
