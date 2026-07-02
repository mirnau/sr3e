// @vitest-environment jsdom

import { describe, expect, it, vi, afterEach } from "vitest";
import { registerChatMessageHTMLHook } from "./chatMessageHTML";

describe("registerChatMessageHTMLHook", () => {
    it("registers Foundry's HTMLElement chat-render hook", () => {
        const on = vi.fn();

        registerChatMessageHTMLHook({ on });

        expect(on).toHaveBeenCalledWith("renderChatMessageHTML", expect.any(Function));
        const handler = on.mock.calls[0]?.[1];
        expect(() => handler?.({}, document.createElement("article"))).not.toThrow();
    });
});

describe("responder click — consumed-flag persistence", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        document.body.innerHTML = "";
    });

    function clickPrompt() {
        document.body.innerHTML = `
            <li class="chat-message" data-message-id="msg1">
                <div data-contest-id="c1">
                    <button data-responder="dodge">Dodge</button>
                </div>
            </li>
        `;
        registerChatMessageHTMLHook({ on: () => {} });
        document.querySelector<HTMLButtonElement>("[data-responder]")?.click();
    }

    it("writes the flag directly when the clicking user is the GM", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) },
            socket: { emit: vi.fn() },
        };

        clickPrompt();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(update).toHaveBeenCalledWith({ "flags.sr3e.consumed": true });
    });

    it("relays through the socket instead of writing directly when the clicking user is not the GM", () => {
        const update = vi.fn();
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: false },
            messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) },
            socket: { emit },
        };

        clickPrompt();

        expect(update).not.toHaveBeenCalled();
        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "updateChatMessage", messageId: "msg1", data: { "flags.sr3e.consumed": true } });
    });
});

describe("die click delegation — works regardless of which DOM copy renders it", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        delete (globalThis as Record<string, unknown>).Roll;
        document.body.innerHTML = "";
    });

    function mockRoll(results: number[]) {
        class MockRoll {
            terms = [{ results: results.map(r => ({ result: r, active: true })) }];
            async evaluate() { return this; }
        }
        (globalThis as Record<string, unknown>).Roll = MockRoll;
    }

    // Simulates the exact scenario this delegation was built to fix: the DOM
    // this click happens in (e.g. a notification popup) is NOT the copy the
    // renderChatMessageHTML hook fired for — only game.messages.get(id) has
    // fresh data. Deliberately never invoke registerChatMessageHTMLHook's
    // render-hook path in these tests, only the click delegation.
    function renderContestSide(): void {
        document.body.innerHTML = `
            <li class="chat-message" data-message-id="msg1">
                <div class="sr3e-contest-side" data-side="initiator">
                    <div class="sr3e-roll-dice">
                        <span class="sr3e-die sr3e-rerollable" data-die-index="0">3</span>
                    </div>
                </div>
            </li>
        `;
    }

    it("reroll fires on the GM's own (initiator) side via delegation alone", async () => {
        mockRoll([6]);
        const initiatorActor = {
            id: "initiator1",
            system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const messageUpdate = vi.fn().mockResolvedValue(undefined);
        const contestOutcome = {
            weaponName: "Predator",
            exportCtx: { familyKey: "firearm", weaponId: null, weaponName: "Predator", plan: null, damage: null, tnBase: 4, tnMods: [], next: { kind: "", ui: {}, args: {} } },
            initiator: { actorId: "initiator1", actorName: "Attacker", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 3 }], rerollCount: 0 },
            target: { actorId: "target1", actorName: "Defender", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 2 }], rerollCount: 0 },
        };
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            users: new Map([["gm1", { id: "gm1", isGM: true, active: true }]]),
            actors: { get: (id: string) => (id === "initiator1" ? initiatorActor : undefined) },
            messages: { get: (id: string) => (id === "msg1" ? { flags: { sr3e: { contestOutcome } }, update: messageUpdate } : undefined) },
        };

        renderContestSide();
        registerChatMessageHTMLHook({ on: () => {} });
        document.querySelector<HTMLElement>(".sr3e-die")?.click();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(initiatorActor.update).toHaveBeenCalled();
        expect(messageUpdate).toHaveBeenCalledWith(expect.objectContaining({
            "flags.sr3e.contestOutcome": expect.objectContaining({
                initiator: expect.objectContaining({ rerollCount: 1 }),
            }),
        }));
    });
});

describe("contest Done button delegation", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        document.body.innerHTML = "";
    });

    function renderContestSide(): void {
        document.body.innerHTML = `
            <li class="chat-message" data-message-id="msg1">
                <div class="sr3e-contest-side" data-side="initiator">
                    <button data-contest-done>Done</button>
                </div>
            </li>
        `;
    }

    it("marks the clicked side done and, once both sides are done, disables the whole card", async () => {
        const messageUpdate = vi.fn().mockResolvedValue(undefined);
        const contestOutcome = {
            contestId: "contest:test",
            weaponName: "Predator",
            exportCtx: { familyKey: "firearm", weaponId: null, weaponName: "Predator", plan: null, damage: null, tnBase: 4, tnMods: [], next: { kind: "", ui: {}, args: {} } },
            initiator: { actorId: "initiator1", actorName: "Attacker", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 6 }], rerollCount: 0, done: false },
            target: { actorId: "target1", actorName: "Defender", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 2 }], rerollCount: 0, done: true },
        };
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            users: new Map([["gm1", { id: "gm1", isGM: true, active: true }]]),
            actors: { get: (id: string) => (id === "initiator1" ? { id: "initiator1" } : undefined) },
            messages: { get: (id: string) => (id === "msg1" ? { flags: { sr3e: { contestOutcome } }, update: messageUpdate } : undefined) },
        };

        renderContestSide();
        registerChatMessageHTMLHook({ on: () => {} });
        document.querySelector<HTMLElement>("[data-contest-done]")?.click();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(messageUpdate).toHaveBeenCalledWith(expect.objectContaining({
            "flags.sr3e.consumed": true,
            "flags.sr3e.contestOutcome": expect.objectContaining({
                initiator: expect.objectContaining({ done: true }),
                target: expect.objectContaining({ done: true }),
            }),
        }));
    });

    it("does nothing when the side is already marked done", async () => {
        const messageUpdate = vi.fn().mockResolvedValue(undefined);
        const contestOutcome = {
            contestId: "contest:test",
            weaponName: "Predator",
            exportCtx: { familyKey: "firearm", weaponId: null, weaponName: "Predator", plan: null, damage: null, tnBase: 4, tnMods: [], next: { kind: "", ui: {}, args: {} } },
            initiator: { actorId: "initiator1", actorName: "Attacker", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 6 }], rerollCount: 0, done: true },
            target: { actorId: "target1", actorName: "Defender", options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" }, results: [{ result: 2 }], rerollCount: 0, done: false },
        };
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            actors: { get: () => undefined },
            messages: { get: (id: string) => (id === "msg1" ? { flags: { sr3e: { contestOutcome } }, update: messageUpdate } : undefined) },
        };

        renderContestSide();
        registerChatMessageHTMLHook({ on: () => {} });
        document.querySelector<HTMLElement>("[data-contest-done]")?.click();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(messageUpdate).not.toHaveBeenCalled();
    });
});

describe("GM visual lockout on render", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        document.body.innerHTML = "";
    });

    function renderMessage(): HTMLElement {
        document.body.innerHTML = `
            <li class="chat-message" data-message-id="msg1">
                <div class="sr3e-contest-side" data-side="initiator">
                    <span class="sr3e-die">3</span>
                    <button data-contest-done>Done</button>
                </div>
                <div class="sr3e-contest-side" data-side="target">
                    <span class="sr3e-die">2</span>
                    <button data-contest-done>Done</button>
                </div>
            </li>
        `;
        return document.querySelector<HTMLElement>(".chat-message")!;
    }

    function fireRenderHook(flags: Record<string, unknown>): void {
        const on = vi.fn();
        registerChatMessageHTMLHook({ on });
        const handler = on.mock.calls[0]?.[1] as (message: unknown, html: HTMLElement) => void;
        handler({ flags: { sr3e: flags } }, renderMessage());
    }

    it("locks only the side controlled by an active player, leaving the other side live", () => {
        const initiatorActor = { id: "initiator1" }; // no active player -> GM is the fallback controller
        const targetActor = { id: "target1", ownership: { player1: 3 } }; // active player controls this one
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            users: new Map([
                ["gm1", { id: "gm1", isGM: true, active: true }],
                ["player1", { id: "player1", isGM: false, active: true }],
            ]),
            actors: { get: (id: string) => (id === "initiator1" ? initiatorActor : id === "target1" ? targetActor : undefined) },
        };

        const contestOutcome = {
            contestId: "c1",
            initiator: { actorId: "initiator1" },
            target: { actorId: "target1" },
        };
        fireRenderHook({ contestOutcome });

        const initiatorSide = document.querySelector<HTMLElement>('[data-side="initiator"]')!;
        const targetSide = document.querySelector<HTMLElement>('[data-side="target"]')!;

        expect(initiatorSide.dataset.sr3eGmLocked).toBeUndefined();
        expect(initiatorSide.querySelector("button")!.disabled).toBe(false);

        expect(targetSide.dataset.sr3eGmLocked).toBe("true");
        expect(targetSide.querySelector("button")!.disabled).toBe(true);
    });

    it("does not lock anything for a non-GM viewer", () => {
        const targetActor = { id: "target1", ownership: { player1: 3 } };
        (globalThis as Record<string, unknown>).game = {
            user: { id: "player1", isGM: false },
            users: new Map([
                ["gm1", { id: "gm1", isGM: true, active: true }],
                ["player1", { id: "player1", isGM: false, active: true }],
            ]),
            actors: { get: (id: string) => (id === "target1" ? targetActor : undefined) },
        };

        fireRenderHook({ contestOutcome: { contestId: "c1", initiator: { actorId: "initiator1" }, target: { actorId: "target1" } } });

        expect(document.querySelector<HTMLElement>('[data-side="target"]')!.dataset.sr3eGmLocked).toBeUndefined();
    });

    it("does not lock when the controlling player is offline", () => {
        const targetActor = { id: "target1", ownership: { player1: 3 } };
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            users: new Map([
                ["gm1", { id: "gm1", isGM: true, active: true }],
                ["player1", { id: "player1", isGM: false, active: false }],
            ]),
            actors: { get: (id: string) => (id === "target1" ? targetActor : undefined) },
        };

        fireRenderHook({ contestOutcome: { contestId: "c1", initiator: { actorId: "initiator1" }, target: { actorId: "target1" } } });

        expect(document.querySelector<HTMLElement>('[data-side="target"]')!.dataset.sr3eGmLocked).toBeUndefined();
    });
});
