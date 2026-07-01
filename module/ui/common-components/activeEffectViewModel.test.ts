import { describe, expect, it } from "vitest";
import { activeEffectViewModel } from "./activeEffectViewModel";

describe("activeEffectViewModel", () => {
    it("projects mutable Foundry active effects into reactive row primitives", () => {
        const duration = { units: "seconds", value: 3 };
        const effect = {
            id: "effect-id",
            name: "Initial",
            img: "initial.svg",
            disabled: true,
            duration,
        } as unknown as ActiveEffect;
        const owner = { id: "item-id" } as unknown as Item;

        const view = activeEffectViewModel(effect, owner, true);

        expect(view).toMatchObject({
            id: "effect-id",
            name: "Initial",
            img: "initial.svg",
            enabled: false,
            canDelete: true,
        });
        expect(view.duration).toEqual(duration);
        expect(view.duration).not.toBe(duration);
    });

    it("creates a new snapshot after Foundry mutates the document object", () => {
        const effect = {
            id: "effect-id",
            name: "Initial",
            img: "initial.svg",
            disabled: true,
            duration: { units: "seconds", value: 3 },
        } as unknown as ActiveEffect;
        const owner = { id: "item-id" } as unknown as Item;

        const before = activeEffectViewModel(effect, owner, true);
        Object.assign(effect as any, {
            name: "Updated",
            disabled: false,
            duration: { units: "rounds", value: 2, rounds: 2 },
        });
        const after = activeEffectViewModel(effect, owner, true);

        expect(before.name).toBe("Initial");
        expect(before.enabled).toBe(false);
        expect(after.name).toBe("Updated");
        expect(after.enabled).toBe(true);
        expect(after.duration).toEqual({ units: "rounds", value: 2, rounds: 2 });
    });
});
