import { resolveLinkedSkill } from "./resolveLinkedSkill";
import type { DefenseHint, ContestExport, RollState } from "../engine/types";
import type { Modifier } from "../modifierList";

export type ProcedureSetup = {
    kind: string;
    title: string;
    rollState: RollState;
    lockPriority: "simple" | "advanced";
    selfPublish: boolean;
    openRoll?: boolean;
    exportFn: () => ContestExport;
    defenseHint: DefenseHint | null;
    commitFn: (roll: unknown, actor: unknown) => Promise<void>;
};

type SkillItem = { id: string; type: string; system: Record<string, unknown> };
type ActorWithItems = {
    system: Record<string, unknown>;
    items: { get?: (id: string) => SkillItem | undefined; contents?: SkillItem[] };
};

type AttributeMap = Record<string, { value?: number; total?: number }>;

function attributeTN(actor: ActorWithItems, attrKey: string): number {
    const attrs = (actor.system as { attributes?: AttributeMap }).attributes ?? {};
    const attr = attrs[attrKey];
    return attr?.total ?? attr?.value ?? 4;
}

export function buildSkillSetup(
    actor: ActorWithItems,
    skillId: string,
    specIndex?: number | null,
    title?: string,
): ProcedureSetup {
    const linkedSkillId = specIndex != null ? `${skillId}::${specIndex}` : skillId;
    const resolved = resolveLinkedSkill(actor, linkedSkillId);

    const dice = resolved?.dice ?? 0;
    const tn = resolved?.linkedAttribute ? attributeTN(actor, resolved.linkedAttribute) : 4;

    const mods: Modifier[] = [];
    if (specIndex != null && resolved && !resolved.specHasOwnValue) {
        mods.push({ name: "defaulting-spec", value: 2, poolCap: Math.floor(dice / 2) });
    }

    const rollState: RollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: tn, modifiers: mods };

    return {
        kind: "skill",
        title: title ?? (resolved?.skill.system as Record<string, unknown>)?.name as string ?? "Skill Roll",
        rollState,
        lockPriority: "simple",
        selfPublish: true,
        defenseHint: { type: "skill", key: skillId, tnMod: 0, tnLabel: "Skill" },
        exportFn: () => ({
            familyKey: "skill",
            weaponId: null,
            weaponName: "",
            plan: null,
            damage: null,
            tnBase: tn,
            tnMods: [],
            next: { kind: "skill-response", ui: { label: "Respond" }, args: { skillId } },
        }),
        commitFn: async () => {},
    };
}

export function buildAttributeSetup(
    actor: ActorWithItems,
    attributeKey: string,
    title?: string,
): ProcedureSetup {
    const attrs = (actor.system as { attributes?: AttributeMap }).attributes ?? {};
    const attr = attrs[attributeKey];
    const dice = attr?.total ?? attr?.value ?? 0;

    const rollState: RollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] };

    return {
        kind: "attribute",
        title: title ?? attributeKey,
        rollState,
        lockPriority: "simple",
        selfPublish: true,
        openRoll: true,
        defenseHint: { type: "attribute", key: attributeKey, tnMod: 0, tnLabel: attributeKey },
        exportFn: () => ({
            familyKey: "attribute",
            weaponId: null,
            weaponName: "",
            plan: null,
            damage: null,
            tnBase: 4,
            tnMods: [],
            next: { kind: "attribute-response", ui: { label: "Respond" }, args: { attributeKey } },
        }),
        commitFn: async () => {},
    };
}

export function buildDicePoolSetup(
    actor: ActorWithItems,
    poolKey: string,
    title: string,
): ProcedureSetup {
    const pools = (actor.system as { dicePools?: Record<string, { value?: number }> }).dicePools ?? {};
    const dice = pools[poolKey]?.value ?? 0;
    const rollState: RollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] };

    return {
        kind: "attribute",
        title,
        rollState,
        lockPriority: "simple",
        selfPublish: true,
        openRoll: true,
        defenseHint: null,
        exportFn: () => ({
            familyKey: "pool",
            weaponId: null,
            weaponName: "",
            plan: null,
            damage: null,
            tnBase: 4,
            tnMods: [],
            next: { kind: "none", ui: {}, args: {} },
        }),
        commitFn: async () => {},
    };
}
