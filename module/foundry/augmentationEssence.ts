import { typekeys } from "../../types/configuration-keys";
import { registerItemEssenceEffectHook } from "./itemEssenceEffect";

const ESSENCE_EFFECT_FLAG = "augmentationEssence";

export function registerAugmentationEssenceHook(): void {
	registerItemEssenceEffectHook(
		typekeys.augmentation,
		ESSENCE_EFFECT_FLAG,
		CONFIG.SR3E.AUGMENTATION.augmentation,
		"systems/sr3e/textures/svgrepo/biohazard-svgrepo-com.svg",
	);
}
