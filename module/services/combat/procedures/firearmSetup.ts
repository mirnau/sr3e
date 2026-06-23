import { beginAttack, onFirearmAttackResolved } from "./firearmFamily";
import { resolveLinkedSkill } from "./resolveLinkedSkill";
import { computeDefaulting } from "../defaultingRules";
import { recoilModifier } from "../recoilTracker";
import { rangeModifier, resolveRange } from "../rangeService";
import type { ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";

type WeaponSystem = {
    linkedSkillId?: string;
    isDefaulting?: boolean;
    difficulty?: number;
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

    const isDefaulting = ws.isDefaulting ?? false;
    const baseTN = ws.difficulty ?? 4;

    let dice = resolved?.dice ?? 0;
    const mods: Modifier[] = [];

    if (isDefaulting && resolved) {
        const defaulting = computeDefaulting(resolved.skill, resolved.specIndex, resolved.linkedAttribute, actor, baseTN, []);
        if (defaulting.mode !== "none") {
            dice = defaulting.dice;
            mods.push(...defaulting.mods);
        }
    }

    const declaredRounds = opts.declaredRounds ?? 1;
    const recoilMod = recoilModifier(actor.id, weapon, declaredRounds);
    if (recoilMod) mods.push(recoilMod);

    let tn = baseTN;
    if (opts.attackerToken && opts.targetToken) {
        const resolution = resolveRange(weapon, opts.attackerToken as never, opts.targetToken as never, opts.rangeShiftLeft ?? 0);
        const rMod = rangeModifier(resolution);
        if (rMod) mods.push(rMod);
        if (resolution.baseTN !== null) tn = resolution.baseTN;
    }

    const rollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: tn, modifiers: mods };

    return {
        kind: "firearm",
        title: "Firearm Attack",
        rollState,
        lockPriority: "advanced",
        selfPublish: true,
        defenseHint: { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
        exportFn: () => {
            const { plan, damage } = beginAttack(actor as never, weapon, { ...opts, resolveAmmo: undefined });
            return {
                familyKey: "firearm",
                weaponId: ws.ammoId ?? null,
                weaponName: (weapon.system as Record<string, unknown>).name as string ?? "",
                plan,
                damage,
                tnBase: tn,
                tnMods: mods,
                next: { kind: "dodge", ui: { label: "Dodge" }, args: {} },
            };
        },
        commitFn: async (_roll, _actor) => {
            await onFirearmAttackResolved(actor as never, weapon as never, { mode: ws.difficulty?.toString() ?? "sa", roundsFired: declaredRounds, attackerTNMod: 0, powerDelta: 0, levelDelta: 0, notes: [] });
        },
    };
}
