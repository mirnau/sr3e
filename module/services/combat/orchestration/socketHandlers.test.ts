import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerSocketHandlers, registerCombatTurnHook } from "./socketHandlers";
import { _resetForTest, waitForResponse } from "../engine/contestCoordinator";

beforeEach(() => {
    _resetForTest();
    (globalThis as Record<string, unknown>).game = {
        user: { id: "u1" }, socket: { on: vi.fn(), emit: vi.fn() },
        actors: { get: vi.fn() }, combat: null,
    };
    (globalThis as Record<string, unknown>).Hooks = { on: vi.fn(), call: vi.fn(), callAll: vi.fn() };
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).Hooks;
});

describe("registerSocketHandlers", () => {
    it("registers on system.sr3e", () => {
        registerSocketHandlers();
        expect((game as Record<string, unknown & { on: ReturnType<typeof vi.fn> }> & { socket: { on: ReturnType<typeof vi.fn> } }).socket.on).toHaveBeenCalledWith("system.sr3e", expect.any(Function));
    });

    it("contestResponse dispatches deliverResponse", async () => {
        const socketOn = (game as Record<string, unknown> & { socket: { on: ReturnType<typeof vi.fn> } }).socket.on as ReturnType<typeof vi.fn>;
        registerSocketHandlers();

        const handler = socketOn.mock.calls[0][1] as (p: unknown) => void;
        const promise = waitForResponse("cx");
        handler({ type: "contestResponse", contestId: "cx", roll: { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } } });

        const roll = await promise;
        expect(roll.meta.procedureKind).toBe("dodge");
    });

    it("contestAbort triggers abort sentinel", async () => {
        const socketOn = (game as Record<string, unknown> & { socket: { on: ReturnType<typeof vi.fn> } }).socket.on as ReturnType<typeof vi.fn>;
        registerSocketHandlers();

        const handler = socketOn.mock.calls[0][1] as (p: unknown) => void;
        const promise = waitForResponse("cy");
        handler({ type: "contestAbort", contestId: "cy", reason: "cancelled" });

        const roll = await promise;
        expect(roll.meta.procedureKind).toBe("__aborted");
    });

    it("updateChatMessage applies the update when the receiving client is GM", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        (game as Record<string, unknown>).user = { id: "gm1", isGM: true };
        (game as Record<string, unknown>).messages = { get: (id: string) => (id === "msg1" ? { update } : undefined) };
        const socketOn = (game as Record<string, unknown> & { socket: { on: ReturnType<typeof vi.fn> } }).socket.on as ReturnType<typeof vi.fn>;
        registerSocketHandlers();

        const handler = socketOn.mock.calls[0][1] as (p: unknown) => void;
        handler({ type: "updateChatMessage", messageId: "msg1", data: { "flags.sr3e.consumed": true } });
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(update).toHaveBeenCalledWith({ "flags.sr3e.consumed": true });
    });

    it("updateChatMessage does nothing when the receiving client is not GM", async () => {
        const update = vi.fn();
        (game as Record<string, unknown>).user = { id: "u1", isGM: false };
        (game as Record<string, unknown>).messages = { get: (id: string) => (id === "msg1" ? { update } : undefined) };
        const socketOn = (game as Record<string, unknown> & { socket: { on: ReturnType<typeof vi.fn> } }).socket.on as ReturnType<typeof vi.fn>;
        registerSocketHandlers();

        const handler = socketOn.mock.calls[0][1] as (p: unknown) => void;
        handler({ type: "updateChatMessage", messageId: "msg1", data: {} });

        expect(update).not.toHaveBeenCalled();
    });
});

describe("registerCombatTurnHook", () => {
    it("registers combatTurn hook", () => {
        registerCombatTurnHook();
        const hooksOn = ((globalThis as Record<string, unknown>).Hooks as { on: ReturnType<typeof vi.fn> }).on;
        expect(hooksOn).toHaveBeenCalledWith("combatTurn", expect.any(Function));
    });

    it("calls unsetFlag on combatant actor", () => {
        const hooksOn = ((globalThis as Record<string, unknown>).Hooks as { on: ReturnType<typeof vi.fn> }).on;
        registerCombatTurnHook();
        const hook = hooksOn.mock.calls[0][1] as (c: unknown, d: Record<string, unknown>) => void;

        const unsetFlag = vi.fn().mockResolvedValue(undefined);
        (game as Record<string, unknown>).combat = {
            combatants: { get: () => ({ actor: { unsetFlag } }) },
        };

        hook({}, { combatantId: "c1" });
        expect(unsetFlag).toHaveBeenCalledWith("sr3e", "fullDefenseActive");
    });
});
