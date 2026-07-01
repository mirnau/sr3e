const FETISH_TYPE = "fetish";

export function hasAttachedFetish(spell: Item): boolean {
    return attachedFetishEffects(spell).length > 0;
}

export function canCastWithAttachedFetish(spell: Item): boolean {
    const effects = attachedFetishEffects(spell);
    if (!effects.length) return true;
    return effects.some(effect => isAttachedFetishAvailable(spell, effect));
}

function attachedFetishEffects(spell: Item): ActiveEffect[] {
    return [...((spell as any).effects?.contents ?? [])].filter((effect: ActiveEffect) => {
        const flags = (effect as any).flags?.sr3e?.gadget;
        return flags?.gadgetType === FETISH_TYPE && flags?.isEnabled !== false && !(effect as any).disabled;
    });
}

function isAttachedFetishAvailable(spell: Item, effect: ActiveEffect): boolean {
    const actor = (spell as any).parent;
    if (!(actor instanceof Actor)) return false;

    const flags = (effect as any).flags?.sr3e?.gadget ?? {};
    if (flags.sourceActorId && flags.sourceActorId !== actor.id) return false;

    const fetish = (actor as any).items?.get(flags.origin);
    if (!fetish || fetish.type !== "gadget") return false;
    if (fetish.system?.type !== FETISH_TYPE) return false;

    return Boolean(fetish.getFlag?.("sr3e", "isEquipped"));
}
