const iconRoot = "systems/sr3e/textures/svgrepo";

export const GADGET_TARGET_ICONS: Record<string, string> = {
    weapon: `${iconRoot}/rifle-gun-svgrepo-com.svg`,
    wearable: `${iconRoot}/jacket-svgrepo-com.svg`,
    fetish: `${iconRoot}/snake-totem-svgrepo-com.svg`,
    medical: `${iconRoot}/medical-cross-svgrepo-com.svg`,
    mechanical: `${iconRoot}/vehicle-speedometer-svgrepo-com.svg`,
    patch: `${iconRoot}/puzzle-piece-svgrepo-com.svg`,
};

export const DEFAULT_GADGET_ICON = `${iconRoot}/cogs-f-svgrepo-com.svg`;

export function gadgetTargetIcon(type: string): string {
    return GADGET_TARGET_ICONS[type] ?? DEFAULT_GADGET_ICON;
}

export function isDefaultGadgetIcon(img: string | undefined): boolean {
    if (!img) return true;
    return img === "icons/svg/item-bag.svg" || img === DEFAULT_GADGET_ICON || Object.values(GADGET_TARGET_ICONS).includes(img);
}
