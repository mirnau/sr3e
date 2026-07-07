import PerformanceSettingsApp from "../../foundry/applications/PerformanceSettingsApp";

const MODULE_ID = "sr3e";

export function registerPerformanceSettingsMenu(): void {
	(game.settings as any).registerMenu(MODULE_ID, "performanceSettings", {
		name: "Performance Impacting Settings",
		label: "Configure",
		hint: "Toggle sheet effects that cost the most to render on low-spec devices.",
		icon: "fas fa-gauge-high",
		type: PerformanceSettingsApp,
	});
}
