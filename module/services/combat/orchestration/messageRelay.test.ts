import { describe, expect, it, vi, afterEach } from "vitest";
import { mergeMessageFlagAsGM, readMessageFlag, requestMessageUpdate, updateMessageAsGM } from "./messageRelay";

afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

describe("updateMessageAsGM", () => {
    it("writes directly when the current user is GM", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) },
        };

        await updateMessageAsGM("msg1", { foo: "bar" });

        expect(update).toHaveBeenCalledWith({ foo: "bar" });
    });

    it("does nothing when the current user is not GM", async () => {
        const update = vi.fn();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: false },
            messages: { get: () => ({ update }) },
        };

        await updateMessageAsGM("msg1", { foo: "bar" });

        expect(update).not.toHaveBeenCalled();
    });

    it("awaits the actual write, so callers can rely on completion before proceeding", async () => {
        let resolveWrite: () => void = () => {};
        const update = vi.fn().mockReturnValue(new Promise<void>(resolve => { resolveWrite = resolve; }));
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            messages: { get: () => ({ update }) },
        };

        let settled = false;
        const p = updateMessageAsGM("msg1", {}).then(() => { settled = true; });

        await Promise.resolve();
        expect(settled).toBe(false);

        resolveWrite();
        await p;
        expect(settled).toBe(true);
    });
});

describe("requestMessageUpdate", () => {
    it("relays via socket when the current user is not GM", async () => {
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: false },
            socket: { emit },
        };

        await requestMessageUpdate("msg1", { foo: "bar" });

        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "updateChatMessage", messageId: "msg1", data: { foo: "bar" } });
    });
});

describe("readMessageFlag", () => {
    it("reads a flag key off the current message", () => {
        (globalThis as Record<string, unknown>).game = {
            messages: { get: (id: string) => (id === "msg1" ? { flags: { sr3e: { someFlag: { a: 1 } } } } : undefined) },
        };

        expect(readMessageFlag("msg1", "someFlag")).toEqual({ a: 1 });
    });

    it("returns undefined for a missing message", () => {
        (globalThis as Record<string, unknown>).game = { messages: { get: () => undefined } };
        expect(readMessageFlag("missing", "someFlag")).toBeUndefined();
    });
});

describe("mergeMessageFlagAsGM", () => {
    it("passes the current flag value into merge and writes the result", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            messages: { get: () => ({ flags: { sr3e: { thing: { count: 2 } } }, update }) },
        };

        await mergeMessageFlagAsGM<{ count: number }>("msg1", "thing", (current) => ({
            data: { "flags.sr3e.thing": { count: (current?.count ?? 0) + 1 } },
        }));

        expect(update).toHaveBeenCalledWith({ "flags.sr3e.thing": { count: 3 } });
    });
});
