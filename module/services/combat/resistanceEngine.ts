import { applyAttackStaging, applyResistanceStaging, boxesForLevel, computeResistanceTN, splitDamageType } from "./damageMath";
import type { DamageStep, DamageTrack } from "./damageMath";
import { computeEffectiveArmor } from "./armorResolver";
import type { EffectiveArmor } from "./armorResolver";
import type { DamagePacket } from "./damagePacket";
import type { Modifier } from "./modifierList";

export type ResistanceBuild = {
    trackKey: DamageTrack;
    tnBase: number;
    tnMods: Modifier[];
    tn: number;
    armor: EffectiveArmor;
    stagedStepBeforeResist: DamageStep;
    boxesIfUnresisted: number;
};

export type ResistanceResult = {
    applied: boolean;
    finalStep: DamageStep | null;
    trackKey: DamageTrack;
    boxes: number;
    notes: string[];
};

type Defender = Parameters<typeof computeEffectiveArmor>[0];

function isFlechette(packet: DamagePacket): boolean {
    return packet.notes.includes("flechette");
}

function isUnarmored(armor: EffectiveArmor): boolean {
    return armor.ballisticBase === 0 && armor.impactBase === 0;
}

export function buildResistance(
    defender: Defender,
    packet: DamagePacket,
    netAttackSuccesses: number,
): ResistanceBuild {
    const { step: baseStep, track: trackKey } = splitDamageType(packet.damageType);
    const stagedStepBeforeResist = applyAttackStaging(baseStep, netAttackSuccesses, packet.levelDelta ?? 0);

    let armor = computeEffectiveArmor(defender, packet);
    const tnMods: Modifier[] = [];
    let flechetteUnarmored = false;

    if (isFlechette(packet)) {
        if (isUnarmored(armor)) {
            flechetteUnarmored = true;
            armor = { ...armor, armorType: "flechette-unarmored", effective: 0 };
            tnMods.push({ name: "flechette-unarmored", value: 0 });
        } else {
            const flechetteEffective = Math.max(armor.ballisticBase, Math.floor(2 * armor.impactBase));
            armor = { ...armor, armorType: "flechette", effective: flechetteEffective };
        }
    }

    const tnBase = computeResistanceTN(packet.power, armor.effective, packet.resistTNAdd);
    const tn = Math.max(2, tnBase + tnMods.reduce((s, m) => s + m.value, 0));

    const stagedStep = flechetteUnarmored
        ? (applyAttackStaging(stagedStepBeforeResist, 0, 1) ?? stagedStepBeforeResist)
        : stagedStepBeforeResist;

    return {
        trackKey,
        tnBase,
        tnMods,
        tn,
        armor,
        stagedStepBeforeResist: stagedStep,
        boxesIfUnresisted: boxesForLevel(stagedStep),
    };
}

export function resolveResistance(build: ResistanceBuild, bodySuccesses: number): ResistanceResult {
    const finalStep = applyResistanceStaging(build.stagedStepBeforeResist, bodySuccesses);
    const notes: string[] = [];
    if (build.armor.armorType === "flechette-unarmored") notes.push("flechette-unarmored");
    if (build.armor.armorType === "flechette") notes.push("flechette");

    return {
        applied: finalStep !== null,
        finalStep,
        trackKey: build.trackKey,
        boxes: finalStep !== null ? boxesForLevel(finalStep) : 0,
        notes,
    };
}
