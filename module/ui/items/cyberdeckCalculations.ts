export type CyberdeckUtility = {
    name: string;
    rating: number;
    size: number;
    type: string;
    active: boolean;
};

export const personaKeys = ["bod", "evasion", "masking", "sensor"] as const;
export const utilityTypes = ["operational", "special", "offensive", "defensive"] as const;

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

export function computeDetectionFactor(masking: unknown, utilities: CyberdeckUtility[], mpcp: number): number {
    const cappedMasking = cappedRating(masking, mpcp);
    const sleaze = utilities
        .filter(u => u.active && u.name.trim().toLowerCase() === "sleaze")
        .reduce((best, u) => Math.max(best, cappedRating(u.rating, mpcp)), 0);
    return sleaze > 0 ? Math.ceil((cappedMasking + sleaze) / 2) : Math.ceil(cappedMasking / 2);
}

export function computeHackingPool(item: Item, mpcp: number): number {
    return Math.floor((actorAttributeTotal(item, "intelligence") + mpcp) / 3);
}

export function computeMatrixReaction(item: Item, responseIncrease: number): number {
    return actorAttributeTotal(item, "reaction") + responseIncrease * 2;
}

export function sanitizeUtility(utility: CyberdeckUtility, mpcp: number): CyberdeckUtility {
    return {
        ...utility,
        rating: cappedRating(utility.rating, mpcp),
        size: Math.max(0, Math.round(numberValue(utility.size))),
        type: utilityTypes.includes(utility.type as any) ? utility.type : "operational",
    };
}

export function cyberdeckMetricUpdates(
    item: Item,
    masking: unknown,
    mpcp: number,
    utilities: CyberdeckUtility[],
): Record<string, unknown> {
    const active = utilities.filter(u => u.active).reduce((sum, u) => sum + numberValue(u.size), 0);
    const storage = utilities.reduce((sum, u) => sum + numberValue(u.size), 0);
    return {
        "system.memory.active.value": active,
        "system.memory.storage.value": storage,
        "system.derived.detectionFactor": computeDetectionFactor(masking, utilities, mpcp),
        "system.derived.hackingPool": computeHackingPool(item, mpcp),
    };
}
