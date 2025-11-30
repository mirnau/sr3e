// imports unchanged
import DamageMath from "./DamageMath.js";
import ArmorResolver from "./ArmorResolver.js";

export default class ResistanceEngine {
   // — TN is Power − Armor ± effects; min 2. Dodge is NOT a factor in SR3 —
   static #buildTNBreakdown({ packet, armor, isFlechette = false }) {
      const mods = [];
      const base = 0;

      const p = Math.max(0, Number(packet?.power ?? 0));
      const resistAdd = Number(packet?.resistTNAdd ?? 0) || 0;

      mods.push({ id: "power", name: "Attack Power", value: p });

      // Standard armor application (skip only for flechette-unarmored case)
      if (!(isFlechette && armor.armorType === "flechette-unarmored")) {
         mods.push({ id: "armor", name: `Armor (${armor.armorType})`, value: -Number(armor?.effective ?? 0) });
      }

      if (resistAdd !== 0) mods.push({ id: "resist-extra", name: "Effects & situational", value: resistAdd });

      let tn = base + mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      if (tn < 2) {
         mods.push({ id: "tn-floor", name: "Minimum TN 2", value: 2 - tn });
         tn = 2;
      }
      return { tnBase: base, tnMods: mods, tn };
   }

   static build(defender, packet, netAttackSuccesses = 0) {
      const { step: baseStep, trackKey } = DamageMath.splitDamageType(packet?.damageType);
      const stagedUpBase = DamageMath.applyAttackStaging(baseStep, netAttackSuccesses, packet?.levelDelta || 0);

      let armor = ArmorResolver.computeEffectiveArmor(defender, packet);
      const isFlechette = (packet?.notes || []).includes("flechette");

      if (isFlechette) {
         const b = armor.ballisticBase || 0;
         const i = armor.impactBase || 0;

         if (b === 0 && i === 0) {
            // Unarmored vs flechette: +1 stage before resist, TN = Power (no armor)
            const stagedUp = DamageMath.stageStep(stagedUpBase, 1);
            const tnParts = this.#buildTNBreakdown({
               packet,
               armor: { ...armor, armorType: "flechette-unarmored", effective: 0 },
               isFlechette: true,
            });

            return {
               trackKey,
               ...tnParts,
               armor: { ...armor, armorType: "flechette-unarmored", effective: 0 },
               stagedStepBeforeResist: stagedUp,
               boxesIfUnresisted: DamageMath.boxesForLevel(stagedUp),
            };
         } else {
            // Armored flechette: effective armor = max(ballistic, 2*impact)
            const flechEff = Math.max(b, Math.floor(2 * i));
            armor = { ...armor, effective: flechEff, armorType: "flechette" };
         }
      }

      const tnParts = this.#buildTNBreakdown({ packet, armor, isFlechette });
      return {
         trackKey,
         ...tnParts,
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
