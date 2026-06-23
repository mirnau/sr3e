import type { DamagePacket } from "./damagePacket";

export type EffectiveArmor = {
    armorType: "ballistic" | "impact" | "flechette" | "flechette-unarmored";
    base: number;
    effective: number;
    ballisticBase: number;
    impactBase: number;
};

type WearableSystem = {
    equipped?: boolean;
    armor?: { ballistic?: number; impact?: number };
};

function layeredTotal(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sorted = [...ratings].sort((a, b) => b - a);
    return sorted[0]! + sorted.slice(1).reduce((sum, r) => sum + Math.floor(r / 2), 0);
}

export function computeEffectiveArmor(
    defender: { items: { contents: Array<{ system: Record<string, unknown> }> } },
    packet: DamagePacket,
): EffectiveArmor {
    const wearables = defender.items.contents
        .map(i => i.system as WearableSystem)
        .filter(s => s.equipped && s.armor);

    const ballisticRatings = wearables.map(s => s.armor?.ballistic ?? 0).filter(v => v > 0);
    const impactRatings = wearables.map(s => s.armor?.impact ?? 0).filter(v => v > 0);

    const ballisticBase = layeredTotal(ballisticRatings);
    const impactBase = layeredTotal(impactRatings);

    const base = packet.armorUse === "ballistic" ? ballisticBase : impactBase;
    const effective = Math.floor(base * (
        packet.armorUse === "ballistic" ? packet.armorMult.ballistic : packet.armorMult.impact
    ));

    return { armorType: packet.armorUse, base, effective, ballisticBase, impactBase };
}
