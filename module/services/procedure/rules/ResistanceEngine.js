import DamageMath from "./DamageMath.js";
import ArmorResolver from "./ArmorResolver.js";

export default class ResistanceEngine {
  static build(defender, packet, netAttackSuccesses = 0) {
    const { step: baseStep, trackKey } = DamageMath.splitDamageType(packet?.damageType);

    const stagedUpBase = DamageMath.applyAttackStaging(baseStep, netAttackSuccesses, packet?.levelDelta || 0);

    let armor = ArmorResolver.computeEffectiveArmor(defender, packet);
    let tn = DamageMath.computeResistanceTN(packet, armor);

    const notes = packet?.notes || [];
    const isFlechette = notes.includes("flechette");

    if (isFlechette) {
      const b = armor.ballisticBase || 0;
      const i = armor.impactBase || 0;

      if (b === 0 && i === 0) {
        const stagedUp = DamageMath.stageStep(stagedUpBase, 1);
        return {
          trackKey,
          tn,
          armor: { ...armor, armorType: "flechette-unarmored" },
          stagedStepBeforeResist: stagedUp,
          boxesIfUnresisted: DamageMath.boxesForLevel(stagedUp),
        };
      } else {
        const flechEff = Math.max(b, Math.floor(2 * i));
        tn = Math.max(2, Math.max(0, Number(packet?.power || 0)) - flechEff + Number(packet?.resistTNAdd || 0));
        armor = { ...armor, effective: flechEff, armorType: "flechette" };
      }
    }

    return {
      trackKey,
      tn,
      armor,
      stagedStepBeforeResist: stagedUpBase,
      boxesIfUnresisted: DamageMath.boxesForLevel(stagedUpBase),
    };
  }

  static resolve(build, bodySuccesses = 0) {
    const { stagedStepBeforeResist, trackKey } = build;
    const finalStep = DamageMath.applyResistanceStaging(stagedStepBeforeResist, bodySuccesses);
    if (!finalStep) return { applied: false, finalStep: null, trackKey, boxes: 0, overflow: 0, notes: ["Staged off"] };
    const boxes = DamageMath.boxesForLevel(finalStep);
    return { applied: boxes > 0, finalStep, trackKey, boxes, overflow: 0, notes: [] };
  }
}
