import { typekeys } from "../../types/configuration-keys";
import { registerItemEssenceEffectHook } from "./itemEssenceEffect";

const ESSENCE_EFFECT_FLAG = "cyberdeckEssence";

export function registerCyberdeckEssenceHook(): void {
	registerItemEssenceEffectHook(
		typekeys.cyberdeck,
		ESSENCE_EFFECT_FLAG,
		CONFIG.SR3E.CYBERDECK.cyberdeck,
		"systems/sr3e/textures/svgrepo/computer-chip-svgrepo-com.svg",
	);
}
