import { totalNumber } from "../../models/common/modifiableNumber";
import type { DamageStep } from "./damageMath";

export type RangeBand = "short" | "medium" | "long" | "extreme";

export type Directive = { k: string; v: string | number };

export type AttackPlan = {
    modeName?: string;
    declaredRounds?: number;
    roundsFired: number;
    attackerTNMod: number;
    powerDelta: number;
    levelDelta: number;
    notes: string[];
};

export type DamagePacket = {
    power: number;
    damageType: string;
    levelDelta: number;
    attackTNAdd: number;
    resistTNAdd: number;
    armorUse: "ballistic" | "impact";
    armorMult: { ballistic: number; impact: number };
    notes: string[];
};

type WeaponSystem = {
    power?: number;
    damage?: unknown;
    damageType?: string;
    levelDelta?: number;
};

export function buildDamagePacket(
    weapon: { system: Record<string, unknown> },
    plan: AttackPlan,
    directives: Directive[] = [],
    _rangeBand?: RangeBand | null,
): DamagePacket {
    const ws = weapon.system as WeaponSystem;
    let power = (ws.power ?? totalNumber(ws.damage, 0)) + plan.powerDelta;
    let damageType = (ws.damageType ?? "m") as string;
    let levelDelta = (ws.levelDelta ?? 0) + plan.levelDelta;
    let attackTNAdd = plan.attackerTNMod;
    let resistTNAdd = 0;
    let armorUse: "ballistic" | "impact" = "ballistic";
    const armorMult = { ballistic: 1, impact: 1 };
    const notes: string[] = [...plan.notes];

    for (const { k, v } of directives) {
        if (k === "damage.powerAdd") power += Number(v);
        else if (k === "damage.levelDelta") levelDelta += Number(v);
        else if (k === "damage.type") damageType = String(v);
        else if (k === "attack.tnAdd") attackTNAdd += Number(v);
        else if (k === "resist.tnAdd") resistTNAdd += Number(v);
        else if (k === "armor.use") armorUse = v as "ballistic" | "impact";
        else if (k === "armor.mult.ballistic") armorMult.ballistic *= Number(v);
        else if (k === "armor.mult.impact") armorMult.impact *= Number(v);
        else if (k.startsWith("special.")) notes.push(String(v));
    }

    return { power, damageType, levelDelta, attackTNAdd, resistTNAdd, armorUse, armorMult, notes };
}

// Satisfies the DamageStep type for external consumers
export type { DamageStep };
