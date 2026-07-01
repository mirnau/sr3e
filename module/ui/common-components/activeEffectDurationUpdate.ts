type FoundryOperatorRoot = {
    foundry?: {
        data?: {
            operators?: {
                ForcedDeletion?: new () => unknown;
            };
        };
    };
};

const durationUnitKeys = ["turns", "rounds", "seconds", "minutes", "hours", "days"] as const;

export type ActiveEffectDurationUpdate = Record<string, unknown>;

export function durationOptions(): string[] {
    return [...durationUnitKeys];
}

export function durationTypeFrom(duration: Record<string, unknown>): string {
    const units = duration.units as string | undefined;
    const legacyType = ownLegacyDurationType(duration);
    if (!units) return "none";
    if (legacyType === "none") return "none";
    const value = durationValueFrom(duration, units);
    if (!Number.isFinite(value)) return "none";
    if (units === "seconds" && value === 0) return "none";
    return units;
}

export function durationValueFrom(duration: Record<string, unknown>, units: string): number {
    return Math.round(Number(ownDurationValue(duration, "value") ?? ownDurationValue(duration, units) ?? 0));
}

export function durationUpdateForCommit(units: string, value: number): ActiveEffectDurationUpdate {
    if (units === "none") {
        return {
            ...clearDurationFields("seconds"),
            "duration.units": "seconds",
            "duration.value": 0,
            "duration.seconds": 0,
        };
    }

    const rounded = integerDurationValue(value);
    return {
        ...clearDurationFields(units),
        "duration.units": units,
        "duration.value": rounded,
        [`duration.${units}`]: rounded,
    };
}

function clearDurationFields(except: string): ActiveEffectDurationUpdate {
    return deleteDurationFields(durationUnitKeys.filter(unit => unit !== except));
}

function deleteDurationFields(keys: readonly string[]): ActiveEffectDurationUpdate {
    return Object.fromEntries(keys.map(key => deleteDurationField(key)));
}

function deleteDurationField(key: string): [string, unknown] {
    const ForcedDeletion = (globalThis as FoundryOperatorRoot).foundry?.data?.operators?.ForcedDeletion;
    if (ForcedDeletion) return [`duration.${key}`, new ForcedDeletion()];
    return [`duration.-=${key}`, null];
}

function integerDurationValue(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value));
}

function ownLegacyDurationType(duration: Record<string, unknown>): string | undefined {
    return ownDurationValue(duration, "type") as string | undefined;
}

function ownDurationValue(duration: Record<string, unknown>, key: string): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(duration, key);
    if (!descriptor || descriptor.get || !("value" in descriptor)) return undefined;
    return descriptor.value;
}
