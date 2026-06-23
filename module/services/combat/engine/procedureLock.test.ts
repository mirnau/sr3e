import { describe, it, expect, beforeEach } from "vitest";
import {
    acquireLock, releaseLock, assertLock, isLocked, currentOwner, _resetForTest,
} from "./procedureLock";

beforeEach(() => _resetForTest());

describe("acquireLock", () => {
    it("acquires when unlocked", () => expect(acquireLock("a")).toBeTruthy());
    it("blocks same priority", () => { acquireLock("a"); expect(acquireLock("b")).toBeNull(); });
    it("blocks lower priority", () => { acquireLock("a", "advanced"); expect(acquireLock("b", "simple")).toBeNull(); });
    it("advanced can preempt simple", () => {
        acquireLock("a", "simple");
        expect(acquireLock("b", "advanced")).toBeTruthy();
    });
    it("advanced cannot preempt advanced", () => {
        acquireLock("a", "advanced");
        expect(acquireLock("b", "advanced")).toBeNull();
    });
});

describe("releaseLock", () => {
    it("releases by ownerKey", () => { acquireLock("a"); expect(releaseLock("a")).toBe(true); });
    it("releases by id", () => { const id = acquireLock("a")!; expect(releaseLock(id)).toBe(true); });
    it("returns false when unlocked", () => expect(releaseLock("x")).toBe(false));
    it("releases, then re-acquirable", () => {
        acquireLock("a"); releaseLock("a");
        expect(acquireLock("b")).toBeTruthy();
    });
});

describe("assertLock", () => {
    it("returns id on success", () => expect(assertLock("a")).toBeTruthy());
    it("returns false when blocked", () => { acquireLock("a"); expect(assertLock("b")).toBe(false); });
});

describe("isLocked / currentOwner", () => {
    it("unlocked state", () => { expect(isLocked()).toBe(false); expect(currentOwner()).toBeNull(); });
    it("locked state", () => { acquireLock("x"); expect(isLocked()).toBe(true); expect(currentOwner()).toBe("x"); });
});
