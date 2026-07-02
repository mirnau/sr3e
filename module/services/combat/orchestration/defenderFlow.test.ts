import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleContestStub, handleDefenderChoice } from "./defenderFlow";
import { _resetForTest, waitForResponse, startContest } from "../engine/contestCoordinator";
import type { ContestStub } from "../engine/types";

beforeEach(() => _resetForTest());
afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

const actor = (id = "def1") => ({
    id, name: "Defender",
    system: { attributes: { reaction: { value: 4, total: 4 }, willpower: { value: 5, total: 5 } } },
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

function mockGame(isGM = false, defenderActor: Record<string, unknown> = actor(), users: Array<Record<string, unknown>> = [{ id: "gm1", isGM: true, active: true }]) {
    const createFn = vi.fn().mockResolvedValue(undefined);
    (globalThis as Record<string, unknown>).game = {
        actors: { get: (id: string) => id === "def1" ? defenderActor : id === "att1" ? { id: "att1", name: "Attacker" } : undefined },
        user: { id: "gm1", isGM },
        users: new Map(users.map(u => [u.id as string, u])),
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

    it("embeds spell resistance button in chat message HTML for spell stubs", async () => {
        const create = mockGame(true);
        await handleContestStub(makeStub("spell-resistance"));
        const html = ((create.mock.calls[0] as Array<Record<string, unknown>>)[0] as Record<string, unknown>).content as string;
        expect(html).toContain('data-responder="spell-resistance"');
        expect(html).toContain("Resist Spell");
    });

    it("whispers the target's controlling player, not the GM triggering the roll", async () => {
        const ownedDefender = { ...actor(), ownership: { player1: 3 } };
        const create = mockGame(true, ownedDefender, [
            { id: "gm1", isGM: true, active: true },
            { id: "player1", isGM: false, active: true },
        ]);

        await handleContestStub(makeStub("dodge"));

        const [call] = create.mock.calls;
        expect((call[0] as Record<string, unknown>).whisper).toEqual(["player1"]);
    });

    it("falls back to whispering the GM when no distinct player controls the target", async () => {
        const create = mockGame(true);

        await handleContestStub(makeStub("dodge"));

        const [call] = create.mock.calls;
        expect((call[0] as Record<string, unknown>).whisper).toEqual(["gm1"]);
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

    it("opens composer with spell-resistance setup", async () => {
        const openFn = vi.fn();
        const { registerComposer } = await import("../procedures/composerService");
        registerComposer(openFn);

        (globalThis as Record<string, unknown>).game = {
            actors: { get: (id: string) => id === "def1" ? actor() : undefined },
            user: { id: "gm1", isGM: true },
        };
        (globalThis as Record<string, unknown>).ChatMessage = { create: vi.fn().mockResolvedValue(undefined) };

        const stub = makeStub("spell-resistance");
        stub.exportCtx.next.args = { force: 6 };
        stub.defenseHint = { type: "attribute", key: "willpower", tnMod: 0, tnLabel: "Willpower" };
        await handleContestStub(stub);
        handleDefenderChoice("c1", "spell-resistance");
        expect(openFn.mock.calls[0][0].kind).toBe("spell-resistance");
        expect(openFn.mock.calls[0][0].rollState.dice).toBe(5);
        expect(openFn.mock.calls[0][0].rollState.targetNumber).toBe(6);
    });
});
