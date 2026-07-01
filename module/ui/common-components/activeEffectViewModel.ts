export type ActiveEffectOwner = Item | Actor;

export type ActiveEffectViewModel = {
    id: string;
    activeEffect: ActiveEffect;
    sourceDocument: ActiveEffectOwner;
    canDelete: boolean;
    name: string;
    img: string;
    duration: Record<string, unknown>;
    enabled: boolean;
};

export function activeEffectViewModel(
    activeEffect: ActiveEffect,
    sourceDocument: ActiveEffectOwner,
    canDelete: boolean,
): ActiveEffectViewModel {
    const effect = activeEffect as any;
    return {
        id: String(effect.id ?? effect._id ?? effect.uuid),
        activeEffect,
        sourceDocument,
        canDelete,
        name: String(effect.name ?? ""),
        img: String(effect.img ?? effect.icon ?? ""),
        duration: cloneDuration(effect.duration),
        enabled: !effect.disabled,
    };
}

function cloneDuration(duration: unknown): Record<string, unknown> {
    if (!duration || typeof duration !== "object") return {};
    const d = duration as Record<string, unknown>;
    return {
        units: ownDurationValue(d, "units"),
        value: ownDurationValue(d, "value"),
        rounds: ownDurationValue(d, "rounds"),
        turns: ownDurationValue(d, "turns"),
        seconds: ownDurationValue(d, "seconds"),
        minutes: ownDurationValue(d, "minutes"),
        hours: ownDurationValue(d, "hours"),
        days: ownDurationValue(d, "days"),
    };
}

function ownDurationValue(duration: Record<string, unknown>, key: string): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(duration, key);
    if (!descriptor || descriptor.get || !("value" in descriptor)) return undefined;
    return descriptor.value;
}
