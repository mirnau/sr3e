export const personaKeys = ["bod", "evasion", "masking", "sensor"] as const;

export function numberValue(value: unknown): number {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function actorAttributeTotal(item: Item, key: string): number {
    const attribute = (item as any).parent?.system?.attributes?.[key];
    return numberValue(attribute?.value) + numberValue(attribute?.mod);
}

export function cappedRating(value: unknown, mpcp: number): number {
    return Math.min(numberValue(value), mpcp);
}

export function responseIncreaseMax(mpcp: number): number {
    return Math.min(3, Math.floor(mpcp / 4));
}

// Sleaze is a Special Utility (SR3 p.207, p.221), not one of the four
// Persona Programs — it only ever feeds Detection Factor, never a roll of
// its own, so it's a dedicated capped field rather than a member of the
// persona/utilities collections.
export function computeDetectionFactor(masking: unknown, sleazeRating: unknown, mpcp: number): number {
    const cappedMasking = cappedRating(masking, mpcp);
    const cappedSleaze = cappedRating(sleazeRating, mpcp);
    return cappedSleaze > 0 ? Math.ceil((cappedMasking + cappedSleaze) / 2) : Math.ceil(cappedMasking / 2);
}

export function computeHackingPool(item: Item, mpcp: number): number {
    return Math.floor((actorAttributeTotal(item, "intelligence") + mpcp) / 3);
}

export function cyberdeckMetricUpdates(
    item: Item,
    masking: unknown,
    mpcp: number,
    sleazeRating: unknown,
): Record<string, unknown> {
    return {
        "system.derived.detectionFactor": computeDetectionFactor(masking, sleazeRating, mpcp),
        "system.derived.hackingPool": computeHackingPool(item, mpcp),
    };
}
