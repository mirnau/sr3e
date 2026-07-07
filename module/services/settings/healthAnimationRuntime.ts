import { writable } from "svelte/store";

const MODULE_ID = "sr3e";
const DISABLE_ECG = "disableEcg";

export const healthAnimationSettingKeys = {
	moduleId: MODULE_ID,
	disableEcg: DISABLE_ECG,
} as const;

export const disableEcgStore = writable(false);

export function disableEcgSetting(): boolean {
	return Boolean((game.settings as any).get(MODULE_ID, DISABLE_ECG));
}

export async function setDisableEcg(value: boolean): Promise<void> {
	await (game.settings as any).set(MODULE_ID, DISABLE_ECG, Boolean(value));
}
