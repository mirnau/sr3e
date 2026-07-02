import type { Modifier } from "./modifierList";
import { sumMods } from "./modifierList";

export type DefaultingMode = "attribute" | "skill" | "specialization" | "none";

export type DefaultingResult = {
    mode: DefaultingMode;
    dice: number;
    mods: Modifier[];
};

type SkillSystem = {
    noDefault?: boolean;
    value?: number;
    specializations?: Array<{ value?: number }>;
};

type ActorSystem = {
    attributes?: Record<string, { value?: number; modifier?: number }>;
};

function attributeRating(actor: { system: Record<string, unknown> }, key: string): number {
    const attrs = (actor.system as ActorSystem).attributes ?? {};
    const attr = attrs[key];
    return (attr?.value ?? 0) + (attr?.modifier ?? 0);
}

export function computeDefaulting(
    skill: { system: Record<string, unknown> } | null,
    specIndex: number | null,
    linkedAttributeKey: string | null,
    caller: { system: Record<string, unknown> },
    baseTN: number,
    nonDefaultingMods: Modifier[],
): DefaultingResult {
    const none: DefaultingResult = { mode: "none", dice: 0, mods: [] };

    const preTN = baseTN + sumMods(nonDefaultingMods);
    if (preTN >= 8) return none;

    if (skill === null) {
        if (linkedAttributeKey === null) return none;
        const dice = attributeRating(caller, linkedAttributeKey);
        return {
            mode: "attribute",
            dice,
            mods: [
                { name: "defaulting-attribute", value: 4, forbidPool: true },
            ],
        };
    }

    const ws = skill.system as SkillSystem;
    if (ws.noDefault) return none;

    if (specIndex !== null && ws.specializations?.[specIndex] !== undefined) {
        const baseRating = ws.value ?? 0;
        const specRating = ws.specializations[specIndex].value ?? 0;
        const cap = Math.floor(baseRating / 2);
        return {
            mode: "specialization",
            dice: specRating,
            mods: [
                { name: "defaulting-spec", value: 3, poolCap: cap },
            ],
        };
    }

    const rating = ws.value ?? 0;
    const cap = Math.floor(rating / 2);
    return {
        mode: "skill",
        dice: rating,
        mods: [
            { name: "defaulting-skill", value: 2, poolCap: cap },
        ],
    };

    // TODO: open test defaulting — TN modifier becomes pool subtraction, not TN add.
    // Rulebook source not yet confirmed. Do not implement until verified.
}
