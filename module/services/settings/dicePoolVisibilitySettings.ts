import { writable } from "svelte/store";

const MODULE_ID = "sr3e";
const SHOW_ALL_DICE_POOLS = "showAllDicePools";

export const dicePoolVisibilitySettingKeys = {
    moduleId: MODULE_ID,
    showAllDicePools: SHOW_ALL_DICE_POOLS,
} as const;

export const showAllDicePoolsStore = writable(false);

export function registerDicePoolVisibilitySettings(): void {
    (game.settings as any).register(MODULE_ID, SHOW_ALL_DICE_POOLS, {
        name: "Show All Dice Pools",
        hint: "Always show Combat, Control, Astral, Spell, and Hacking dice pools on character sheets.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value: boolean) => showAllDicePoolsStore.set(Boolean(value)),
    });

    showAllDicePoolsStore.set(showAllDicePoolsSetting());
}

export function showAllDicePoolsSetting(): boolean {
    return Boolean((game.settings as any).get(MODULE_ID, SHOW_ALL_DICE_POOLS));
}
