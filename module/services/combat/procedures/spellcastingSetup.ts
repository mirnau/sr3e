import { canCastWithAttachedFetish, hasAttachedFetish } from "../../spells/spellFetish";
import { applySustainedSpellEffect, computeEffectChatTag } from "../../spells/spellEffectApplication";
import { addSustainedSpell, sustainingTnPenalty } from "../../spells/sustainedSpells";
import type { Modifier } from "../modifierList";
import type { PoolOption, ProcedureSetup } from "./simpleSetups";

type ActorLike = {
    id?: string;
    system?: Record<string, any>;
    items: { get?: (id: string) => ItemLike | undefined; contents?: ItemLike[]; [Symbol.iterator]?: () => IterableIterator<ItemLike> };
    getFlag?: (scope: string, key: string) => unknown;
    setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
};

type ItemLike = {
    id?: string;
    name?: string;
    type: string;
    system: Record<string, any>;
    getFlag?: (scope: string, key: string) => unknown;
};

const SORCERY = "sorcery";

export function buildSpellcastingSetup(actor: ActorLike, spell: ItemLike): ProcedureSetup {
    const sorcery = findSorcerySkill(actor);
    const learnedForce = learnedForceMax(spell.system?.learnedForce);
    const target = spellTarget(spell);
    const focusOptions = eligibleFocusOptions(actor, spell);
    const fetishLimited = hasAttachedFetish(spell as never);
    const fetishReady = canCastWithAttachedFetish(spell as never);
    const defenseHint = spellDefenseHint(target.payload);
    const damageLevel = normalizedDamageLevel(spell.system?.drain?.damageLevel);
    const sustaining = sustainingTnPenalty(actor);
    const modifiers = sustaining > 0
        ? [...target.modifiers, { id: "sustaining-penalty", name: "Sustaining Spells", value: sustaining }]
        : target.modifiers;
    const isSustained = spell.system?.duration?.type === "sustained";
    const spellChatOptions: Record<string, unknown> = {
        id: spell.id ?? null,
        name: spell.name ?? "Spell",
        force: learnedForce,
        learnedForce,
        type: spell.system?.type ?? "",
        category: spell.system?.category ?? "",
        exclusive: Boolean(spell.system?.limits?.exclusive),
        fetishLimited,
        fetishReady,
        damageLevel,
        drain: {
            powerModifier: Number(spell.system?.drain?.powerModifier ?? 0),
            damageLevelModifier: Number(spell.system?.drain?.damageLevelModifier ?? 0),
        },
        targeting: target.payload,
    };
    const damageLevelControl = isDamageSpell(spell) ? {
        value: damageLevel,
        options: [
            { value: "l", label: "Light" },
            { value: "m", label: "Moderate" },
            { value: "s", label: "Serious" },
            { value: "d", label: "Deadly" },
        ],
    } : undefined;

    return {
        kind: "spellcasting",
        title: `Cast ${spell.name ?? "Spell"}`,
        rollState: { dice: sorcery?.dice ?? 0, poolDice: 0, karmaDice: 0, targetNumber: target.targetNumber, modifiers },
        lockPriority: "advanced",
        selfPublish: true,
        initialPoolKey: "spell",
        poolOptions: focusOptions,
        forceControl: { value: learnedForce, min: 1, max: learnedForce },
        damageLevelControl,
        extraOptions: {
            spell: spellChatOptions,
        },
        defenseHint,
        exportFn: () => ({
            familyKey: "spellcasting",
            weaponId: spell.id ?? null,
            weaponName: spell.name ?? "Spell",
            plan: null,
            damage: null,
            tnBase: target.targetNumber,
            tnMods: modifiers,
            next: {
                kind: defenseHint ? "spell-resistance" : "spellcasting-result",
                ui: { label: defenseHint ? "Resist Spell" : "Resolve Spell" },
                args: {
                    spellId: spell.id ?? null,
                    target: target.payload,
                    force: learnedForce,
                    damageLevel,
                    spellCategory: spell.system?.category ?? "",
                    manipulationSubtype: spell.system?.manipulationSubtype ?? "",
                },
            },
        }),
        commitFn: async (roll: unknown) => {
            const effect = spell.system?.effect ?? {};
            const chatTag = computeEffectChatTag(
                effect,
                roll,
                target.targetNumber,
                learnedForce,
                casterMagic(actor),
                Number(spell.system?.duration?.rounds ?? 0),
            );
            if (chatTag) spellChatOptions.effectTag = chatTag;

            if (!isSustained) return;
            const sustained = await addSustainedSpell(actor, {
                spellId: spell.id ?? null,
                spellName: spell.name ?? "Spell",
                force: learnedForce,
                sustainingFocusId: null,
            });
            await applySustainedSpellEffect(actor, sustained.id, effect, roll, target.targetNumber, learnedForce, spell.name ?? "Spell");
        },
    };
}

export function canStartSpellcasting(spell: ItemLike): boolean {
    return !hasAttachedFetish(spell as never) || canCastWithAttachedFetish(spell as never);
}

function casterMagic(actor: ActorLike): number {
    const magic = actor.system?.attributes?.magic;
    return Number(magic?.total ?? magic?.value ?? 0);
}

function learnedForceMax(value: unknown): number {
    const learned = Math.floor(Number(value ?? 0));
    return Math.max(1, learned);
}

function findSorcerySkill(actor: ActorLike): { id: string; dice: number } | null {
    const skill = actorItems(actor).find(item =>
        item.type === "skill" &&
        String(item.name ?? "").trim().toLowerCase() === SORCERY
    );
    if (!skill) return null;
    const sub = skill.system?.[`${skill.system?.skillType ?? "active"}Skill`] ?? {};
    return { id: skill.id ?? "", dice: Number(sub.value ?? 0) };
}

function spellTarget(spell: ItemLike): { targetNumber: number; modifiers: Modifier[]; payload: Record<string, unknown> } {
    if (isElementalManipulation(spell)) {
        const tn = nonZero(spell.system?.elementalAttack?.targetNumber, 4);
        return { targetNumber: tn, modifiers: [], payload: { kind: "elemental", targetNumber: tn, canDodge: Boolean(spell.system?.elementalAttack?.canDodge ?? true) } };
    }

    const targeting = spell.system?.targeting ?? {};
    const kind = String(targeting.kind ?? "attribute");
    if (kind === "static") {
        const tn = nonZero(targeting.staticTargetNumber, 4);
        return { targetNumber: tn, modifiers: [], payload: { kind, targetNumber: tn } };
    }
    if (kind === "objectResistance") {
        const tn = nonZero(targeting.staticTargetNumber, 4);
        return { targetNumber: tn, modifiers: [], payload: { kind, targetNumber: tn } };
    }

    const targetAttribute = String(targeting.attribute || spell.system?.resistance?.attribute || "willpower");
    const resistanceAttribute = String(spell.system?.resistance?.attribute || targetAttribute);
    return {
        targetNumber: selectedTargetAttributeTN(targetAttribute),
        modifiers: [],
        payload: { kind: "attribute", targetAttribute, resistanceAttribute },
    };
}

function spellDefenseHint(payload: Record<string, unknown>) {
    if (payload.kind !== "attribute") return null;
    const key = String(payload.resistanceAttribute || payload.targetAttribute || "willpower");
    return { type: "attribute" as const, key, tnMod: 0, tnLabel: label(key) };
}

function selectedTargetAttributeTN(attribute: string): number {
    const targets = typeof game !== "undefined" ? [...((game.user as any)?.targets ?? [])] : [];
    if (targets.length !== 1) return 4;
    const attrs = (targets[0] as any)?.actor?.system?.attributes ?? {};
    const attr = attrs[attribute];
    return Math.max(2, Number(attr?.total ?? attr?.value ?? 4));
}

function label(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function isElementalManipulation(spell: ItemLike): boolean {
    return spell.system?.category === "manipulation" && spell.system?.manipulationSubtype === "elemental";
}

function isDamageSpell(spell: ItemLike): boolean {
    return spell.system?.category === "combat" || isElementalManipulation(spell);
}

function normalizedDamageLevel(value: unknown): string {
    const raw = String(value || "m").toLowerCase();
    return ["l", "m", "s", "d"].includes(raw) ? raw : "m";
}

function nonZero(value: unknown, fallback: number): number {
    const num = Math.floor(Number(value ?? 0));
    return num > 0 ? num : fallback;
}

function eligibleFocusOptions(actor: ActorLike, spell: ItemLike): PoolOption[] {
    return actorItems(actor)
        .filter(item => isEligibleFocus(item, spell))
        .map(item => {
            const force = Number(item.system?.force ?? 0);
            const spent = Number(item.system?.dice?.spent ?? 0);
            return {
                key: `focus:${item.id}`,
                itemId: item.id,
                label: item.name ?? "Focus",
                available: Math.max(0, force - spent),
                source: "item" as const,
            };
        })
        .filter(option => option.available > 0);
}

function isEligibleFocus(focus: ItemLike, spell: ItemLike): boolean {
    if (focus.type !== "focus") return false;
    if (!focus.system?.bonded || !focus.system?.active) return false;
    if (!focus.getFlag?.("sr3e", "isEquipped")) return false;

    const focusType = focus.system?.focusType;
    if (focusType === "power") return true;
    if (focusType === "specificSpell") return focus.system?.scope?.spellItemId === spell.id;
    if (focusType === "spellCategory") return focus.system?.scope?.category === spell.system?.category;
    return false;
}

function actorItems(actor: ActorLike): ItemLike[] {
    if (actor.items.contents) return actor.items.contents;
    if (typeof actor.items[Symbol.iterator] === "function") return [...actor.items as Iterable<ItemLike>];
    return [];
}
