// imports unchanged
import DamageMath from "./DamageMath.js";
import ArmorResolver from "./ArmorResolver.js";

export default class ResistanceEngine {
   // ResistanceEngine.js
   static #buildTNBreakdown({ packet, armor, isFlechette = false }) {
      const mods = [];
      const base = 0; // SR3E damage resistance is Power − Armor ± effects (min 2)

      const p = Math.max(0, Number(packet?.power ?? 0));
      const resistAdd = Number(packet?.resistTNAdd ?? 0) || 0;

      mods.push({ id: "power", name: "Attack Power", value: p });

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
      DEBUG && LOG.info("", [__FILE__, __LINE__, ResistanceEngine.build.name]);
      const { step: baseStep, trackKey } = DamageMath.splitDamageType(packet?.damageType);
      const stagedUpBase = DamageMath.applyAttackStaging(baseStep, netAttackSuccesses, packet?.levelDelta || 0);

      let armor = ArmorResolver.computeEffectiveArmor(defender, packet);
      let isFlechette = (packet?.notes || []).includes("flechette");

      // Handle flechette special before the TN breakdown
      if (isFlechette) {
         const b = armor.ballisticBase || 0;
         const i = armor.impactBase || 0;

         if (b === 0 && i === 0) {
            // Unarmored flechette: pre-resist stage bump (+1), TN breakdown still runs (power only)
            const stagedUp = DamageMath.stageStep(stagedUpBase, 1);
            const tnParts = this.#buildTNBreakdown({
               packet,
               armor: { ...armor, armorType: "flechette-unarmored", effective: 0 },
               isFlechette: true,
            });

            return {
               trackKey,
               ...tnParts, // { tnBase, tnMods, tn }
               armor: { ...armor, armorType: "flechette-unarmored", effective: 0 },
               stagedStepBeforeResist: stagedUp,
               boxesIfUnresisted: DamageMath.boxesForLevel(stagedUp),
            };
         } else {
            // Armored flechette uses max(ballistic, 2*impact)
            const flechEff = Math.max(b, Math.floor(2 * i));
            armor = { ...armor, effective: flechEff, armorType: "flechette" };
         }
      }

      // Normal / armored path TN parts
      const tnParts = this.#buildTNBreakdown({ packet, armor, isFlechette });
      return {
         trackKey,
         ...tnParts, // { tnBase, tnMods, tn }
         armor,
         stagedStepBeforeResist: stagedUpBase,
         boxesIfUnresisted: DamageMath.boxesForLevel(stagedUpBase),
      };
   }

   static resolve(build, bodySuccesses = 0) {
      DEBUG && LOG.info("", [__FILE__, __LINE__, ResistanceEngine.resolve.name]);
      const { stagedStepBeforeResist, trackKey } = build;
      const finalStep = DamageMath.applyResistanceStaging(stagedStepBeforeResist, bodySuccesses);
      if (!finalStep)
         return { applied: false, finalStep: null, trackKey, boxes: 0, overflow: 0, notes: ["Staged off"] };
      const boxes = DamageMath.boxesForLevel(finalStep);
      return { applied: boxes > 0, finalStep, trackKey, boxes, overflow: 0, notes: [] };
   }
}
