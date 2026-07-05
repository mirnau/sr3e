import type { Modifier } from "./modifierList";

type MagicSystem = { awakened?: { archetype?: string } };
type TnModifierSystem = { tnModifiers?: { targetKind: string; targetId: string; modifier: number }[] };
type ItemLike = { type: string; system?: unknown; name?: string };
type ActorWithItems = { items: { contents?: ItemLike[] } | ItemLike[] };

function ownedItems(actor: ActorWithItems): ItemLike[] {
    return Array.isArray(actor.items) ? actor.items : (actor.items?.contents ?? []);
}

// No tradition enum spans magician/adept/mystic-adept — archetype is the
// only field distinguishing them (MagicModel.awakened.archetype).
function isAdept(actor: ActorWithItems): boolean {
    return ownedItems(actor).some(
        (item) => item.type === "magic" && (item.system as MagicSystem)?.awakened?.archetype === "adept",
    );
}

function modsFrom(items: ItemLike[], itemType: string, targetKind: "skill" | "attribute", targetId: string): Modifier[] {
    const mods: Modifier[] = [];
    for (const item of items) {
        if (item.type !== itemType) continue;
        const entries = (item.system as TnModifierSystem)?.tnModifiers ?? [];
        entries.forEach((entry, index) => {
            if (entry.targetKind !== targetKind || entry.targetId !== targetId) return;
            mods.push({
                id: `${itemType}-${item.name ?? "item"}-${index}`,
                name: item.name ?? "Item",
                value: entry.modifier,
            });
        });
    }
    return mods;
}

// Skill/attribute-keyed TN modifiers have no ActiveEffect equivalent — this
// is scanned fresh at setup-build time, same insertion point as the
// defaulting-spec modifier in buildSkillSetup/buildAttributeSetup. Adept
// powers are gated on archetype (only adepts have them); augmentations
// (cyberware/bioware) have no such gate — any character can own one.
export function tnModifiers(
    actor: ActorWithItems,
    targetKind: "skill" | "attribute",
    targetId: string,
): Modifier[] {
    const items = ownedItems(actor);
    const mods = modsFrom(items, "augmentation", targetKind, targetId);
    if (isAdept(actor)) mods.push(...modsFrom(items, "adeptpower", targetKind, targetId));
    return mods;
}
