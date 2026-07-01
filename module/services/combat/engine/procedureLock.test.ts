import { describe, it, expect, beforeEach } from "vitest";
import {
    acquireLock, releaseLock, assertLock, isLocked, currentOwner, _resetForTest,
} from "./procedureLock";

beforeEach(() => _resetForTest());

describe("acquireLock", () => {
    it("acquires when unlocked", () => expect(acquireLock("actor1:firearm")).toBeTruthy());

    it("blocks same actor at same priority", () => {
        acquireLock("actor1:firearm");
        expect(acquireLock("actor1:dodge")).toBeNull();
    });

    it("blocks same actor at lower priority", () => {
        acquireLock("actor1:firearm", "advanced");
        expect(acquireLock("actor1:dodge", "simple")).toBeNull();
    });

    it("advanced can preempt simple for same actor", () => {
        acquireLock("actor1:simple-skill", "simple");
        expect(acquireLock("actor1:firearm", "advanced")).toBeTruthy();
    });

    it("advanced cannot preempt advanced for same actor", () => {
        acquireLock("actor1:firearm", "advanced");
        expect(acquireLock("actor1:dodge", "advanced")).toBeNull();
    });

    it("different actors are never blocked by each other", () => {
        acquireLock("actor1:firearm", "advanced");
        expect(acquireLock("actor2:dodge", "simple")).toBeTruthy();
    });
});

describe("releaseLock", () => {
    it("releases by ownerKey", () => { acquireLock("actor1:firearm"); expect(releaseLock("actor1:firearm")).toBe(true); });
    it("releases by id", () => { const id = acquireLock("actor1:firearm")!; expect(releaseLock(id)).toBe(true); });
    it("returns false when unlocked", () => expect(releaseLock("actor1:firearm")).toBe(false));
    it("releases, then same actor can re-acquire", () => {
        acquireLock("actor1:firearm"); releaseLock("actor1:firearm");
        expect(acquireLock("actor1:dodge")).toBeTruthy();
    });
});

describe("assertLock", () => {
    it("returns id on success", () => expect(assertLock("actor1:firearm")).toBeTruthy());
    it("returns false when same actor blocked", () => {
        acquireLock("actor1:firearm");
        expect(assertLock("actor1:dodge")).toBe(false);
    });
});

describe("isLocked / currentOwner", () => {
    it("unlocked state", () => { expect(isLocked()).toBe(false); expect(currentOwner()).toBeNull(); });
    it("locked state", () => { acquireLock("actor1:firearm"); expect(isLocked()).toBe(true); expect(currentOwner()).toBe("actor1:firearm"); });
});
