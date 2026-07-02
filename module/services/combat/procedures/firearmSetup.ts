import { beginAttack, onFirearmAttackResolved } from "./firearmFamily";
import { resolveLinkedSkill } from "./resolveLinkedSkill";
import { recoilModifier } from "../recoilTracker";
import { rangeModifier, resolveRange } from "../rangeService";
import type { ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";

// Converts raw canvas pixel positions to scene distance units (meters) using
// the active grid's pixel-per-square and distance-per-square settings.
function gridMeasure(a: { x: number; y: number }, b: { x: number; y: number }): { distance: number } {
    const g = typeof canvas !== "undefined" ? (canvas as any).grid : null;
    const size: number = g?.size ?? 100;
    const distPerSquare: number = g?.distance ?? 1;
    const pixels = Math.hypot(b.x - a.x, b.y - a.y);
    return { distance: (pixels / size) * distPerSquare };
}

type WeaponSystem = {
    linkedSkillId?: string;
    isDefaulting?: boolean;
    mode?: string;
    ammoId?: string;
};

type ActorId = { id: string };
type ActorWithItems = {
    system: Record<string, unknown>;
    items: { get?: (id: string) => { id: string; type: string; system: Record<string, unknown> } | undefined; contents?: Array<{ id: string; type: string; system: Record<string, unknown> }> };
};

type FirearmOpts = {
    declaredRounds?: number;
    ammoAvailable?: number | null;
    attackerToken?: { x?: number; y?: number } | null;
    targetToken?: { x?: number; y?: number } | null;
    rangeShiftLeft?: number;
};

export function buildFirearmSetup(
    actor: ActorId & ActorWithItems & { update?: (d: Record<string, unknown>) => Promise<unknown> },
    weapon: { system: Record<string, unknown>; update?: (d: Record<string, unknown>) => Promise<unknown> },
    opts: FirearmOpts = {},
): ProcedureSetup {
    const ws = weapon.system as WeaponSystem;
    const linkedSkillId = ws.linkedSkillId ?? "";
    const resolved = resolveLinkedSkill(actor, linkedSkillId);
    const baseTN = 4;

    const dice = resolved?.dice ?? 0;
    const mods: Modifier[] = [];

    const declaredRounds = opts.declaredRounds ?? 1;
    const recoilMod = recoilModifier(actor.id, weapon, declaredRounds);
    if (recoilMod) mods.push(recoilMod);

    let tn = baseTN;
    if (opts.attackerToken && opts.targetToken) {
        const resolution = resolveRange(
            weapon,
            opts.attackerToken as never,
            opts.targetToken as never,
            opts.rangeShiftLeft ?? 0,
            gridMeasure,
        );
        const rMod = rangeModifier(resolution);
        if (rMod) mods.push(rMod);
        if (resolution.baseTN !== null) tn = resolution.baseTN;
    }

    const rollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: tn, modifiers: mods };
    const skillName = (resolved?.skill as unknown as { name?: string })?.name ?? "Firearm Attack";
    const title = resolved?.specName ?? skillName;

    return {
        kind: "firearm",
        title,
        rollState,
        lockPriority: "advanced",
        selfPublish: true,
        defaultingAttributeKey: resolved?.linkedAttribute ?? null,
        // When the weapon itself defaults on roll, linkedSkillId already
        // points AT the substitute skill (e.g. Guns for an Assault Rifle) —
        // nothing to exclude, it's the pre-selected candidate instead.
        defaultingExcludeSkillId: ws.isDefaulting ? null : (resolved?.skillId ?? null),
        itemDefaultsOnRoll: ws.isDefaulting ?? false,
        defaultingPreselectedSkillId: ws.isDefaulting ? (linkedSkillId || null) : null,
        defenseHint: { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
        exportFn: () => {
            const { plan, damage } = beginAttack(actor as never, weapon, { ...opts, resolveAmmo: undefined });
            return {
                familyKey: "firearm",
                weaponId: ws.ammoId ?? null,
                weaponName: (weapon as unknown as { name?: string }).name ?? "",
                plan,
                damage,
                tnBase: tn,
                tnMods: mods,
                next: { kind: "dodge", ui: { label: "Dodge" }, args: {} },
            };
        },
        commitFn: async (_roll, _actor) => {
            await onFirearmAttackResolved(actor as never, weapon as never, { mode: ws.mode ?? "semiauto", roundsFired: declaredRounds, attackerTNMod: 0, powerDelta: 0, levelDelta: 0, notes: [] });
        },
    };
}
