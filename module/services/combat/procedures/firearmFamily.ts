import { buildDamagePacket } from "../damagePacket";
import { buildResistance } from "../resistanceEngine";
import { recoilModifier, bumpPhaseShots, bumpOOCShots, inCombat } from "../recoilTracker";
import { resolveRange } from "../rangeService";
import { getAttachedAmmo, consume, ammoDirectives } from "./ammoService";
import type { DamagePacket, AttackPlan } from "../damagePacket";
import type { ResistanceBuild } from "../resistanceEngine";
import type { RangeBand } from "../rangeService";

type FireMode = "manual" | "semiauto" | "burst" | "fullauto" | "energy";

type WeaponSystem = {
    power?: number;
    damageType?: string;
    levelDelta?: number;
    mode?: string;
    ammoId?: string;
};

type ActorId = { id: string };

export type FirearmPlan = {
    mode: string;
    roundsFired: number;
    attackerTNMod: number;
    powerDelta: number;
    levelDelta: number;
    notes: string[];
};

type PlanOpts = {
    phaseShotsFired?: number;
    declaredRounds?: number;
    ammoAvailable?: number | null;
};

export function planFire(
    actorId: string,
    weapon: { system: Record<string, unknown> },
    opts: PlanOpts = {},
): FirearmPlan {
    const ws = weapon.system as WeaponSystem;
    const mode = (ws.mode ?? "semiauto") as FireMode;
    const declaredRounds = opts.declaredRounds ?? 1;
    const ammoAvailable = opts.ammoAvailable ?? null;

    let roundsFired = declaredRounds;
    if (ammoAvailable !== null) roundsFired = Math.min(roundsFired, ammoAvailable);

    const recoilMod = recoilModifier(actorId, weapon, roundsFired);
    const attackerTNMod = recoilMod?.value ?? 0;

    const notes: string[] = [];
    if (attackerTNMod > 0) notes.push(`recoil +${attackerTNMod}`);

    return { mode, roundsFired, attackerTNMod, powerDelta: 0, levelDelta: 0, notes };
}

type BeginAttackOpts = {
    declaredRounds?: number;
    ammoAvailable?: number | null;
    attackerToken?: { x?: number; y?: number } | null;
    targetToken?: { x?: number; y?: number } | null;
    rangeShiftLeft?: number;
    resolveAmmo?: (actor: unknown, weapon: unknown) => { item: unknown; directives: ReturnType<typeof ammoDirectives> } | null;
};

export function beginAttack(
    actor: ActorId & { system: Record<string, unknown> },
    weapon: { system: Record<string, unknown> },
    opts: BeginAttackOpts = {},
): { plan: FirearmPlan; damage: DamagePacket; ammoId: string; rangeBand: RangeBand | null } {
    const ws = weapon.system as WeaponSystem;
    const ammoAvailable = opts.ammoAvailable ?? null;
    const plan = planFire(actor.id, weapon, { declaredRounds: opts.declaredRounds, ammoAvailable });

    let directives: ReturnType<typeof ammoDirectives> = [];
    let ammoId = ws.ammoId ?? "";

    if (opts.resolveAmmo) {
        const resolved = opts.resolveAmmo(actor, weapon);
        if (resolved) {
            directives = resolved.directives;
            ammoId = (resolved.item as { id: string }).id;
        }
    }

    let rangeBand: RangeBand | null = null;
    if (opts.attackerToken && opts.targetToken) {
        const resolution = resolveRange(weapon, opts.attackerToken as never, opts.targetToken as never, opts.rangeShiftLeft ?? 0);
        rangeBand = resolution.band;
    }

    const attackPlan: AttackPlan = {
        modeName: plan.mode,
        roundsFired: plan.roundsFired,
        attackerTNMod: plan.attackerTNMod,
        powerDelta: plan.powerDelta,
        levelDelta: plan.levelDelta,
        notes: [...plan.notes],
    };

    const damage = buildDamagePacket(weapon, attackPlan, directives, rangeBand);
    return { plan, damage, ammoId, rangeBand };
}

export function prepareFirearmResistance(
    defender: Parameters<typeof buildResistance>[0],
    _plan: FirearmPlan,
    damage: DamagePacket,
    netAttackSuccesses = 0,
): ResistanceBuild {
    return buildResistance(defender, damage, netAttackSuccesses);
}

export async function onFirearmAttackResolved(
    actor: Parameters<typeof getAttachedAmmo>[0] & ActorId & { update?: (d: Record<string, unknown>) => Promise<unknown> },
    weapon: Parameters<typeof getAttachedAmmo>[1] & { update?: (d: Record<string, unknown>) => Promise<unknown> },
    plan: FirearmPlan,
    // Vehicle-mounted weapons can draw ammo from either the vehicle or the
    // shooting character — defaults to just the acting actor for the
    // personal-weapon path, where ammo always lives on the same actor.
    ammoActors: Parameters<typeof getAttachedAmmo>[0][] = [actor],
): Promise<void> {
    await consume(ammoActors, weapon, plan.roundsFired);
    if (inCombat()) {
        bumpPhaseShots(actor.id, plan.roundsFired);
    } else {
        bumpOOCShots(actor.id, plan.roundsFired);
    }
}
