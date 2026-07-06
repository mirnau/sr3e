type EffectDuration = {
    units?: string;
    seconds?: number | null;
    rounds?: number | null;
    turns?: number | null;
};

type TokenEffectLike = {
    duration?: EffectDuration;
    statuses?: Set<string> | string[] | null;
    toObject?: () => { duration?: EffectDuration };
};

const WRAPPED_FLAG = "__sr3ePermanentEffectIconFilter";

export function isPermanentNonStatusEffect(effect: TokenEffectLike): boolean {
    if (hasStatuses(effect.statuses)) return false;
    // Reads the raw persisted duration (toObject) rather than the live
    // ActiveEffectDuration getter — the latter trips Foundry's own
    // ActiveEffectDuration#type -> #units compatibility-warning logger on
    // every access for unmigrated effect data, spamming the console on
    // every token draw even though we never touch #type ourselves.
    const duration = effect.toObject?.().duration ?? effect.duration;
    return !hasFiniteDuration(duration);
}

export function tokenIconEffects<T extends TokenEffectLike>(effects: Iterable<T>): T[] {
    return Array.from(effects).filter(effect => !isPermanentNonStatusEffect(effect));
}

export function registerPermanentEffectTokenIconFilter(): void {
    const tokenClass = (globalThis as any).foundry?.canvas?.placeables?.Token ?? (globalThis as any).Token;
    const tokenPrototype = tokenClass?.prototype;
    if (!tokenPrototype?._drawEffects || tokenPrototype[WRAPPED_FLAG]) return;

    const originalDrawEffects = tokenPrototype._drawEffects;
    tokenPrototype._drawEffects = function sr3eDrawEffectsWithoutPermanentIcons(...args: unknown[]) {
        return withFilteredTemporaryEffects(this, () => originalDrawEffects.apply(this, args));
    };
    tokenPrototype[WRAPPED_FLAG] = true;
}

function hasStatuses(statuses: TokenEffectLike["statuses"]): boolean {
    if (!statuses) return false;
    return statuses instanceof Set ? statuses.size > 0 : statuses.length > 0;
}

function hasFiniteDuration(duration?: EffectDuration): boolean {
    if (!duration) return false;
    if (duration.units && duration.units !== "none") return true;
    return [duration.seconds, duration.rounds, duration.turns].some(value => Number(value) > 0);
}

function withFilteredTemporaryEffects(token: any, draw: () => unknown): unknown {
    const actor = token?.actor;
    const effects = actor?.temporaryEffects;
    if (!actor || !effects) return draw();

    const ownDescriptor = Object.getOwnPropertyDescriptor(actor, "temporaryEffects");
    const filtered = collectionLike(tokenIconEffects(effects));

    try {
        Object.defineProperty(actor, "temporaryEffects", {
            configurable: true,
            get: () => filtered,
        });
    } catch {
        return draw();
    }

    try {
        return draw();
    } finally {
        if (ownDescriptor) Object.defineProperty(actor, "temporaryEffects", ownDescriptor);
        else delete actor.temporaryEffects;
    }
}

function collectionLike<T>(effects: T[]): T[] {
    Object.defineProperty(effects, "contents", { configurable: true, value: effects });
    Object.defineProperty(effects, "size", { configurable: true, value: effects.length });
    return effects;
}
