import type { Modifier } from "./modifierList";

type MagicSystem = { awakened?: { archetype?: string } };
type AdeptPowerSystem = { tnModifiers?: { targetKind: string; targetId: string; modifier: number }[] };
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

// Skill/attribute-keyed TN modifiers have no ActiveEffect equivalent — this
// is scanned fresh at setup-build time, same insertion point as the
// defaulting-spec modifier in buildSkillSetup/buildAttributeSetup.
export function adeptPowerTnModifiers(
    actor: ActorWithItems,
    targetKind: "skill" | "attribute",
    targetId: string,
): Modifier[] {
    if (!isAdept(actor)) return [];

    const mods: Modifier[] = [];
    for (const item of ownedItems(actor)) {
        if (item.type !== "adeptpower") continue;
        const entries = (item.system as AdeptPowerSystem)?.tnModifiers ?? [];
        entries.forEach((entry, index) => {
            if (entry.targetKind !== targetKind || entry.targetId !== targetId) return;
            mods.push({
                id: `adeptpower-${item.name ?? "power"}-${index}`,
                name: item.name ?? "Adept Power",
                value: entry.modifier,
            });
        });
    }
    return mods;
}
