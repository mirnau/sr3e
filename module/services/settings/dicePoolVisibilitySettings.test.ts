import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    dicePoolVisibilitySettingKeys,
    registerDicePoolVisibilitySettings,
    showAllDicePoolsStore,
} from "./dicePoolVisibilitySettings";

describe("dicePoolVisibilitySettings", () => {
    beforeEach(() => {
        showAllDicePoolsStore.set(false);
    });

    it("registers disabled by default and syncs setting changes to the live store", () => {
        let onChange: ((value: boolean) => void) | undefined;
        const register = vi.fn((_moduleId, _key, config) => {
            onChange = config.onChange;
        });

        (globalThis as Record<string, unknown>).game = {
            settings: {
                register,
                get: () => false,
            },
        };

        registerDicePoolVisibilitySettings();

        expect(register).toHaveBeenCalledWith(
            dicePoolVisibilitySettingKeys.moduleId,
            dicePoolVisibilitySettingKeys.showAllDicePools,
            expect.objectContaining({ default: false, type: Boolean }),
        );
        expect(get(showAllDicePoolsStore)).toBe(false);

        onChange?.(true);

        expect(get(showAllDicePoolsStore)).toBe(true);
    });
});
