import { planStrike } from "./meleeFamily";
import { resolveLinkedSkill } from "./resolveLinkedSkill";
import { computeDefaulting } from "../defaultingRules";
import type { ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";

type WeaponSystem = {
    linkedSkillId?: string;
    isDefaulting?: boolean;
    difficulty?: number;
    damage?: number;
    damageType?: string;
};

type ActorSystem = {
    attributes?: Record<string, { value?: number; total?: number }>;
};

type ActorWithItems = {
    id: string;
    system: Record<string, unknown>;
    items: { get?: (id: string) => { id: string; type: string; system: Record<string, unknown> } | undefined; contents?: Array<{ id: string; type: string; system: Record<string, unknown> }> };
};

type MeleeOpts = {
    situational?: { calledShot?: boolean; calledShotStages?: number };
};

export function buildMeleeSetup(
    actor: ActorWithItems,
    weapon: { system: Record<string, unknown> },
    opts: MeleeOpts = {},
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

    const rollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: baseTN, modifiers: mods };
    const as = actor.system as ActorSystem;
    const str = as.attributes?.strength?.total ?? as.attributes?.strength?.value ?? 0;
    const damagePacketSnapshot = planStrike(actor, weapon, opts.situational);

    return {
        kind: "melee",
        title: "Melee Attack",
        rollState,
        lockPriority: "advanced",
        selfPublish: true,
        defenseHint: { type: "skill", key: "melee", tnMod: 0, tnLabel: "Melee Combat" },
        exportFn: () => ({
            familyKey: "melee",
            weaponId: null,
            weaponName: (weapon.system as Record<string, unknown>).name as string ?? "",
            plan: { roundsFired: 1, attackerTNMod: 0, powerDelta: str, levelDelta: 0, notes: [] },
            damage: damagePacketSnapshot,
            tnBase: baseTN,
            tnMods: mods,
            next: {
                kind: "melee-defense",
                ui: { standard: "Melee Combat", full: "Full Defense" },
                args: {},
            },
        }),
        commitFn: async () => {},
    };
}
