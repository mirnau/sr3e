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
    openTest?: boolean;
    initialPoolKey?: string;
    poolOptions?: PoolOption[];
    forceControl?: ForceControl;
    damageLevelControl?: DamageLevelControl;
    // The linked skill's attribute key, for the composer to compute
    // skill-to-attribute defaulting reactively when the player selects
    // Defaulting — null/absent when the roll has no defaultable linked skill.
    defaultingAttributeKey?: string | null;
    // The linked skill's own id, excluded from the composer's
    // defaulting-candidate picker (can't default a skill to itself).
    defaultingExcludeSkillId?: string | null;
    // True when the item itself is configured to always be a defaulting
    // action (weapon.system.isDefaulting) — e.g. wielding an Assault Rifle
    // with the Guns skill because that's what linkedSkillId points at.
    // Pre-selects Defaulting mode in the composer; the player can still
    // override.
    itemDefaultsOnRoll?: boolean;
    // The item's own linkedSkillId ("skillId" or "skillId::specIndex"),
    // pre-selected in the composer's defaulting-candidate picker when
    // itemDefaultsOnRoll is true.
    defaultingPreselectedSkillId?: string | null;
    extraOptions?: Record<string, unknown>;
    exportFn: () => ContestExport;
    defenseHint: DefenseHint | null;
    commitFn: (roll: unknown, actor: unknown) => Promise<void>;
};

export type ForceControl = {
    value: number;
    min: number;
    max: number;
};

export type DamageLevelControl = {
    value: string;
    options: Array<{ value: string; label: string }>;
};

export type PoolOption = {
    key: string;
    label: string;
    available: number;
    source: "actor" | "item";
    itemId?: string;
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

    const skillTitle = title ?? (resolved?.skill.system as Record<string, unknown>)?.name as string ?? "Skill Roll";
    return {
        kind: "skill",
        title: skillTitle,
        rollState,
        lockPriority: "simple",
        selfPublish: true,
        openRoll: true,
        defenseHint: { type: "skill", key: skillId, tnMod: 0, tnLabel: "Skill" },
        exportFn: () => ({
            familyKey: "skill",
            weaponId: null,
            weaponName: skillTitle,
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

    const attrTitle = title ?? attributeKey;
    return {
        kind: "attribute",
        title: attrTitle,
        rollState,
        lockPriority: "simple",
        selfPublish: true,
        openRoll: true,
        defenseHint: { type: "attribute", key: attributeKey, tnMod: 0, tnLabel: attributeKey },
        exportFn: () => ({
            familyKey: "attribute",
            weaponId: null,
            weaponName: attrTitle,
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
        openTest: true,
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
