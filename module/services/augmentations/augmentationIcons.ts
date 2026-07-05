const iconRoot = "systems/sr3e/textures/svgrepo";

export const AUGMENTATION_CATEGORY_ICONS: Record<string, string> = {
    cyberware: `${iconRoot}/cyber-eye-svgrepo-com.svg`,
    bioware: `${iconRoot}/biohazard-svgrepo-com.svg`,
};

export const DEFAULT_AUGMENTATION_ICON = AUGMENTATION_CATEGORY_ICONS.bioware;

export function augmentationCategoryIcon(category: string): string {
    return AUGMENTATION_CATEGORY_ICONS[category] ?? DEFAULT_AUGMENTATION_ICON;
}

export function isDefaultAugmentationIcon(img: string | undefined): boolean {
    if (!img) return true;
    return img === "icons/svg/item-bag.svg" || Object.values(AUGMENTATION_CATEGORY_ICONS).includes(img);
}
