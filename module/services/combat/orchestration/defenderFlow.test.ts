import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleContestStub, handleDefenderChoice } from "./defenderFlow";
import { _resetForTest, waitForResponse, startContest } from "../engine/contestCoordinator";
import type { ContestStub } from "../engine/types";

beforeEach(() => _resetForTest());
afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

const actor = (id = "def1") => ({
    id, name: "Defender",
    system: { attributes: { reaction: { value: 4, total: 4 } } },
    items: { contents: [], get: () => undefined },
});

function makeStub(nextKind = "dodge"): ContestStub {
    return {
        contestId: "c1",
        initiator: { actorId: "att1", userId: "u1" },
        target: { actorId: "def1", name: "Defender", tokenId: null, sceneId: null },
        initiatorRoll: { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" } },
        procedureKind: "firearm",
        exportCtx: {
            familyKey: "firearm", weaponId: null, weaponName: "Predator", plan: null, damage: null,
            tnBase: 5, tnMods: [],
            next: { kind: nextKind, ui: {}, args: {} },
        },
        defenseHint: { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
    };
}

function mockGame(isGM = false) {
    const createFn = vi.fn().mockResolvedValue(undefined);
    (globalThis as Record<string, unknown>).game = {
        actors: { get: (id: string) => id === "def1" ? actor() : id === "att1" ? { id: "att1", name: "Attacker" } : undefined },
        user: { id: "gm1", isGM },
    };
    (globalThis as Record<string, unknown>).ChatMessage = { create: createFn };
    return createFn;
}

describe("handleContestStub", () => {
    it("expires contest when actor not found", async () => {
        const promise = waitForResponse("c1");
        await handleContestStub(makeStub());
        const result = await promise;
        expect(result.meta.procedureKind).toBe("__aborted");
    });

    it("registers stub when defender found", async () => {
        mockGame(false);
        await handleContestStub(makeStub("dodge"));
        // no ChatMessage call — not GM
        const create = (globalThis as Record<string, unknown>).ChatMessage as { create: ReturnType<typeof vi.fn> };
        expect(create.create).not.toHaveBeenCalled();
    });

    it("sends chat message when GM receives stub", async () => {
        const create = mockGame(true);
        await handleContestStub(makeStub("dodge"));
        expect(create).toHaveBeenCalledOnce();
        const [call] = create.mock.calls;
        expect((call[0] as Record<string, unknown>).flags).toMatchObject({ sr3e: { opposed: "c1" } });
    });

    it("embeds dodge buttons in chat message HTML for ranged stubs", async () => {
        const create = mockGame(true);
        await handleContestStub(makeStub("dodge"));
        const html = ((create.mock.calls[0] as Array<Record<string, unknown>>)[0] as Record<string, unknown>).content as string;
        expect(html).toContain('data-responder="dodge"');
        expect(html).toContain('data-responder="no"');
    });

    it("embeds melee buttons in chat message HTML for melee stubs", async () => {
        const create = mockGame(true);
        await handleContestStub(makeStub("melee-defense"));
        const html = ((create.mock.calls[0] as Array<Record<string, unknown>>)[0] as Record<string, unknown>).content as string;
        expect(html).toContain('data-responder="standard"');
        expect(html).toContain('data-responder="full"');
    });
});

describe("handleDefenderChoice", () => {
    it("expires contest on 'no'", () => {
        const promise = waitForResponse("c1");
        handleDefenderChoice("c1", "no");
        return promise.then(r => expect(r.meta.procedureKind).toBe("__aborted"));
    });

    it("expires contest on null key", () => {
        const promise = waitForResponse("c1");
        handleDefenderChoice("c1", null);
        return promise.then(r => expect(r.meta.procedureKind).toBe("__aborted"));
    });

    it("expires contest when record not found", () => {
        const promise = waitForResponse("c2");
        handleDefenderChoice("c2", "dodge");
        return promise.then(r => expect(r.meta.procedureKind).toBe("__aborted"));
    });

    it("opens composer with dodge setup on 'dodge'", async () => {
        const openFn = vi.fn();
        const { registerComposer } = await import("../procedures/composerService");
        registerComposer(openFn);

        (globalThis as Record<string, unknown>).game = {
            actors: { get: (id: string) => id === "def1" ? actor() : undefined },
            user: { id: "gm1", isGM: true },
        };
        (globalThis as Record<string, unknown>).ChatMessage = { create: vi.fn().mockResolvedValue(undefined) };

        await handleContestStub(makeStub("dodge"));
        handleDefenderChoice("c1", "dodge");
        expect(openFn).toHaveBeenCalledOnce();
        expect(openFn.mock.calls[0][0].kind).toBe("dodge");
    });

    it("opens composer with melee-defense setup on 'standard'", async () => {
        const openFn = vi.fn();
        const { registerComposer } = await import("../procedures/composerService");
        registerComposer(openFn);

        (globalThis as Record<string, unknown>).game = {
            actors: { get: (id: string) => id === "def1" ? actor() : undefined },
            user: { id: "gm1", isGM: true },
        };
        (globalThis as Record<string, unknown>).ChatMessage = { create: vi.fn().mockResolvedValue(undefined) };

        await handleContestStub(makeStub("melee-defense"));
        handleDefenderChoice("c1", "standard");
        expect(openFn.mock.calls[0][0].kind).toBe("melee-defense");
    });
});
