import { typekeys } from "../../types/configuration-keys";
import { registerItemEssenceEffectHook } from "./itemEssenceEffect";

const ESSENCE_EFFECT_FLAG = "vehicleControlRigEssence";

export function registerVehicleControlRigEssenceHook(): void {
	registerItemEssenceEffectHook(
		typekeys.vehiclecontrolrig,
		ESSENCE_EFFECT_FLAG,
		CONFIG.SR3E.VEHICLE_CONTROL_RIG.vehiclecontrolrig,
		"systems/sr3e/textures/svgrepo/controller-1-svgrepo-com.svg",
	);
}
