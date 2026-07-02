import { afterEach, describe, expect, it, vi } from "vitest";
import { applySustainedSpellEffect, computeEffectChatTag } from "./spellEffectApplication";

function actor(flags: any[] = [], createEmbeddedDocuments?: (type: string, data: unknown[]) => Promise<any[]>) {
    let stored = flags;
    return {
        getFlag: vi.fn(() => stored),
        setFlag: vi.fn(async (_scope: string, _key: string, value: unknown) => {
            stored = value as any[];
        }),
        createEmbeddedDocuments,
    };
}

function rollWithResults(results: number[]) {
    return { terms: [{ results: results.map(result => ({ result, active: true })) }], options: {} };
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
});

describe("applySustainedSpellEffect", () => {
    it("does nothing for a non-attributeModPerTwo algorithm", async () => {
        const createEmbeddedDocuments = vi.fn();
        const a = actor([{ id: "s1", appliedEffectUuid: null }], createEmbeddedDocuments);
        await applySustainedSpellEffect(a, "s1", { algorithm: "tnPerSuccess", targetPath: "system.attributes.reaction.mod" }, rollWithResults([5, 6]), 4, 5, "Confusion");
        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does nothing when targetPath is missing", async () => {
        const createEmbeddedDocuments = vi.fn();
        const a = actor([{ id: "s1", appliedEffectUuid: null }], createEmbeddedDocuments);
        await applySustainedSpellEffect(a, "s1", { algorithm: "attributeModPerTwo" }, rollWithResults([5, 6]), 4, 5, "Increase Reflexes");
        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("creates a tagged effect on the caster when scope is caster", async () => {
        const createEmbeddedDocuments = vi.fn().mockResolvedValue([{ uuid: "Actor.a1.ActiveEffect.e1" }]);
        const a = actor([{ id: "s1", appliedEffectUuid: null }], createEmbeddedDocuments);
        await applySustainedSpellEffect(
            a, "s1",
            { algorithm: "attributeModPerTwo", targetPath: "system.attributes.reaction.mod", scope: "caster" },
            rollWithResults([5, 6, 6, 3]), 4, 5, "Increase Reflexes",
        );
        expect(createEmbeddedDocuments).toHaveBeenCalledWith("ActiveEffect", [
            expect.objectContaining({ changes: [{ key: "system.attributes.reaction.mod", type: "add", value: "1", priority: 0 }] }),
        ]);
    });

    it("resolves a single targeted token's actor when scope is target", async () => {
        const targetCreate = vi.fn().mockResolvedValue([{ uuid: "Actor.a2.ActiveEffect.e2" }]);
        const casterCreate = vi.fn();
        const targetActor = actor([{ id: "s1", appliedEffectUuid: null }], targetCreate);
        const caster = actor([{ id: "s1", appliedEffectUuid: null }], casterCreate);
        (globalThis as Record<string, unknown>).game = { user: { targets: new Set([{ actor: targetActor }]) } };

        await applySustainedSpellEffect(
            caster, "s1",
            { algorithm: "attributeModPerTwo", targetPath: "system.attributes.body.mod", scope: "target" },
            rollWithResults([5, 6, 6, 3]), 4, 5, "Increase Body",
        );

        expect(targetCreate).toHaveBeenCalled();
        expect(casterCreate).not.toHaveBeenCalled();
    });

    it("does nothing when scope is target but zero or multiple tokens are targeted", async () => {
        const createEmbeddedDocuments = vi.fn();
        const a = actor([{ id: "s1", appliedEffectUuid: null }], createEmbeddedDocuments);
        (globalThis as Record<string, unknown>).game = { user: { targets: new Set() } };

        await applySustainedSpellEffect(
            a, "s1",
            { algorithm: "attributeModPerTwo", targetPath: "system.attributes.body.mod", scope: "target" },
            rollWithResults([5, 6]), 4, 5, "Increase Body",
        );

        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});

describe("computeEffectChatTag", () => {
    it("returns null when the spell has no effect algorithm", () => {
        expect(computeEffectChatTag({}, rollWithResults([5, 6]), 4, 5, 6, 0)).toBeNull();
    });

    it("returns null for attributeModPerTwo (auto-applied as an ActiveEffect instead)", () => {
        expect(computeEffectChatTag({ algorithm: "attributeModPerTwo" }, rollWithResults([5, 6]), 4, 5, 6, 0)).toBeNull();
    });

    it("computes a TN-modifier family tag (Confusion/Silence/Ice Sheet)", () => {
        expect(computeEffectChatTag({ algorithm: "tnPerSuccess" }, rollWithResults([5, 6, 6]), 4, 6, 6, 0)).toBe("TN Modifier: 3");
        expect(computeEffectChatTag({ algorithm: "tnPerSuccessCapped8" }, rollWithResults([5, 6, 6]), 4, 6, 6, 0)).toBe("TN Modifier: 3");
        expect(computeEffectChatTag({ algorithm: "tnPerTwoSuccesses" }, rollWithResults([5, 6, 6]), 4, 6, 6, 0)).toBe("TN Modifier: 1");
    });

    it("computes a zone/step family tag (Barrier/Levitate/Magic Fingers)", () => {
        expect(computeEffectChatTag({ algorithm: "barrierStep" }, rollWithResults([5, 6, 6]), 4, 4, 6, 0)).toBe("Barrier Rating: 5");
        expect(computeEffectChatTag({ algorithm: "levitateSpeed" }, rollWithResults([5, 6, 6]), 4, 5, 6, 0)).toBe("Levitate Speed (m/Combat Turn): 18");
        expect(computeEffectChatTag({ algorithm: "magicFingers" }, rollWithResults([5, 6, 6]), 4, 5, 6, 0)).toBe("Magic Fingers (Str/Qui): 3");
    });

    it("computes a pre-cast-time family tag (Detection Range/Permanent Time)", () => {
        expect(computeEffectChatTag({ algorithm: "detectionRange" }, rollWithResults([]), 4, 5, 6, 0)).toBe("Detection Range (m): 30");
        expect(computeEffectChatTag({ algorithm: "permanentTimeDivisor" }, rollWithResults([5, 6, 6]), 4, 5, 6, 10)).toBe("Casting Time (Combat Turns): 3.3333333333333335");
    });
});
