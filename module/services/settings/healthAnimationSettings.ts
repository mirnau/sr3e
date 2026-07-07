import { disableEcgSetting, disableEcgStore, healthAnimationSettingKeys } from "./healthAnimationRuntime";

export function registerHealthAnimationSettings(): void {
	(game.settings as any).register(healthAnimationSettingKeys.moduleId, healthAnimationSettingKeys.disableEcg, {
		name: "Disable ECG Animation",
		hint: "Hides the animated heartbeat monitor on character sheets and stops its canvas rendering. Health penalty still applies as normal.",
		scope: "client",
		config: false,
		type: Boolean,
		default: false,
		onChange: (value: boolean) => disableEcgStore.set(Boolean(value)),
	});

	disableEcgStore.set(disableEcgSetting());
}
