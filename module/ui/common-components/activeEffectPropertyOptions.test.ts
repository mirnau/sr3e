import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { activeEffectPropertyOptions } from "./activeEffectPropertyOptions";

beforeEach(() => {
    (globalThis as Record<string, unknown>).game = {
        i18n: {
            localize: (key: string) => ({ "sr3e.attributes.body": "Body", "sr3e.movement.walking": "Walking", "sr3e.dicePools.combat": "Combat Pool" } as Record<string, string>)[key] ?? key,
        },
    };
    (globalThis as Record<string, unknown>).CONFIG = {
        SR3E: {
            ATTRIBUTES: { body: "sr3e.attributes.body", currentSpeed: undefined },
            MOVEMENT: { walking: "sr3e.movement.walking" },
            DICE_POOLS: { combat: "sr3e.dicePools.combat" },
        },
        Actor: { dataModels: { character: null } },
    };
    (globalThis as Record<string, unknown>).foundry = {
        utils: {
            flattenObject: (obj: Record<string, unknown>) => {
                const out: Record<string, unknown> = {};
                const walk = (o: Record<string, unknown>, prefix: string) => {
                    for (const [k, v] of Object.entries(o)) {
                        const path = prefix ? `${prefix}.${k}` : k;
                        if (v && typeof v === "object" && !Array.isArray(v)) walk(v as Record<string, unknown>, path);
                        else out[path] = v;
                    }
                };
                walk(obj, "");
                return out;
            },
        },
    };
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).CONFIG;
    delete (globalThis as Record<string, unknown>).foundry;
});

const doc = () => ({ toObject: () => ({ system: {} }) }) as unknown as Item;
const effect = () => ({}) as unknown as ActiveEffect;

describe("activeEffectPropertyOptions — mod path labels", () => {
    it("uses the known localization for an attribute mod path", () => {
        const system = { attributes: { body: { mod: 0 } } };
        const options = activeEffectPropertyOptions({
            document: { toObject: () => ({ system }) } as unknown as Item,
            activeEffect: effect(),
            target: "self",
        });
        expect(options).toEqual([expect.objectContaining({ value: "system.attributes.body.mod", label: "Body" })]);
    });

    it("humanizes a camelCase segment with no known localization", () => {
        const system = { attributes: { currentSpeed: { mod: 0 } } };
        const options = activeEffectPropertyOptions({
            document: { toObject: () => ({ system }) } as unknown as Item,
            activeEffect: effect(),
            target: "self",
        });
        expect(options).toEqual([expect.objectContaining({ value: "system.attributes.currentSpeed.mod", label: "Current Speed" })]);
    });

    it("never surfaces the raw dot-path as a label", () => {
        const system = { movement: { walking: { mod: 0 } } };
        const options = activeEffectPropertyOptions({
            document: { toObject: () => ({ system }) } as unknown as Item,
            activeEffect: effect(),
            target: "self",
        });
        expect(options[0]?.label).not.toContain(".");
        expect(options[0]?.label).not.toContain("system");
    });
});
