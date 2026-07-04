import { describe, expect, it } from "vitest";
import { activeEffectChangeData, normalizeActiveEffectChange } from "./activeEffectChanges";

describe("activeEffectChanges", () => {
    it("serializes subtract as a string \"add\" type with a negative value", () => {
        expect(activeEffectChangeData({ key: "system.attributes.essence.mod", type: "subtract", value: "2", priority: 20 })).toEqual({
            key: "system.attributes.essence.mod",
            type: "add",
            value: "-2",
            priority: 20,
        });
    });

    it("preserves an explicit positive-valued add as add", () => {
        expect(normalizeActiveEffectChange({ key: "system.attributes.body.mod", type: "add", value: "2", priority: 20 })).toEqual({
            key: "system.attributes.body.mod",
            type: "add",
            value: "2",
            priority: 20,
        });
    });

    it("reads a negative-valued add as subtract, unsigning the displayed value", () => {
        expect(normalizeActiveEffectChange({ key: "system.attributes.essence.mod", type: "add", value: "-2", priority: 20 })).toEqual({
            key: "system.attributes.essence.mod",
            type: "subtract",
            value: "2",
            priority: 20,
        });
    });

    it("reads a zero-valued add as subtract, not add", () => {
        expect(normalizeActiveEffectChange({ key: "system.attributes.essence.mod", type: "add", value: "0", priority: 20 })).toEqual({
            key: "system.attributes.essence.mod",
            type: "subtract",
            value: "0",
            priority: 20,
        });
    });

    it("never accesses .mode when .type is already valid", () => {
        let modeAccessed = false;
        const change = {
            key: "system.attributes.essence.mod",
            type: "add" as const,
            value: "2",
            priority: 20,
            get mode() { modeAccessed = true; return 2; },
        };

        normalizeActiveEffectChange(change);

        expect(modeAccessed).toBe(false);
    });

    it("defaults to subtract when type is missing and value is non-positive", () => {
        expect(normalizeActiveEffectChange({ key: "system.attributes.essence.mod", value: "-2", priority: 20 })).toEqual({
            key: "system.attributes.essence.mod",
            type: "subtract",
            value: "2",
            priority: 20,
        });
    });
});
