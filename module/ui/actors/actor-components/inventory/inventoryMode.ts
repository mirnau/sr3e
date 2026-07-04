export type InventoryMode = "personal" | "vehicle";

export function inventoryModeFor(actor: Actor): InventoryMode {
    return (actor as unknown as { type?: string }).type === "mechanical" ? "vehicle" : "personal";
}

export const INVENTORY_PRIMARY_FLAG: Record<InventoryMode, string> = {
    personal: "isFavorite",
    vehicle: "isHardpoint",
};

export const INVENTORY_SECONDARY_FLAG: Record<InventoryMode, string> = {
    personal: "isEquipped",
    vehicle: "isFirmpoint",
};

export function isWeightExempt(mode: InventoryMode, item: { flags?: { sr3e?: Record<string, unknown> } }): boolean {
    if (mode !== "vehicle") return false;
    const flags = item.flags?.sr3e ?? {};
    return Boolean(flags[INVENTORY_PRIMARY_FLAG.vehicle] || flags[INVENTORY_SECONDARY_FLAG.vehicle]);
}

export type MountUsage = { hardpointCount: number; firmpointCount: number };

export function mountUsage(mode: InventoryMode, items: { flags?: { sr3e?: Record<string, unknown> } }[]): MountUsage {
    if (mode !== "vehicle") return { hardpointCount: 0, firmpointCount: 0 };
    return {
        hardpointCount: items.filter((i) => i.flags?.sr3e?.[INVENTORY_PRIMARY_FLAG.vehicle]).length,
        firmpointCount: items.filter((i) => i.flags?.sr3e?.[INVENTORY_SECONDARY_FLAG.vehicle]).length,
    };
}
