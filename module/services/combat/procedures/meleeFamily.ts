import { buildDamagePacket } from "../damagePacket";
import { buildResistance } from "../resistanceEngine";
import type { DamagePacket } from "../damagePacket";
import type { ResistanceBuild } from "../resistanceEngine";

type AttackerSystem = {
    attributes?: Record<string, { value?: number; total?: number }>;
};

type WeaponSystem = {
    damage?: number;
    damageType?: string;
    levelDelta?: number;
};

type MeleeSituational = {
    calledShot?: boolean;
    calledShotStages?: number;
};

export function planStrike(
    attacker: { system: Record<string, unknown> },
    weapon: { system: Record<string, unknown> },
    situational: MeleeSituational = {},
): DamagePacket {
    const as = attacker.system as AttackerSystem;
    const ws = weapon.system as WeaponSystem;

    const str = as.attributes?.strength?.total ?? as.attributes?.strength?.value ?? 0;
    const bonus = ws.damage ?? 0;
    const power = str + bonus;

    const calledShotDelta = situational.calledShot ? (situational.calledShotStages ?? 1) : 0;

    const directives: { k: string; v: string | number }[] = [{ k: "armor.use", v: "impact" }];
    if (calledShotDelta > 0) directives.push({ k: "damage.levelDelta", v: calledShotDelta });

    const plan = {
        roundsFired: 1,
        attackerTNMod: 0,
        powerDelta: power - (ws.damageType ? 0 : 0),
        levelDelta: 0,
        notes: situational.calledShot ? ["called-shot"] : [],
    };

    // Override weapon power: build with power=0 on weapon, supply delta
    const stubWeapon = {
        system: {
            ...weapon.system,
            power,
            damageType: ws.damageType ?? "m",
            levelDelta: 0,
        },
    };

    return buildDamagePacket(stubWeapon, { ...plan, powerDelta: 0 }, directives);
}

export function prepareMeleeResistance(
    defender: Parameters<typeof buildResistance>[0],
    packet: DamagePacket,
    netAttackSuccesses = 0,
): ResistanceBuild {
    return buildResistance(defender, packet, netAttackSuccesses);
}
