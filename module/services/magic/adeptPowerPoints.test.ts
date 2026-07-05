import { describe, it, expect, vi } from "vitest";
import { getAdeptMagicItem, getPowerPointsAvailable, spendPowerPoints, buyPowerPoints, GOOD_KARMA_PER_POWER_POINT } from "./adeptPowerPoints";

function makeMagicItem(archetype: string, powerPoints = 0) {
    return {
        type: "magic",
        system: { awakened: { archetype }, adeptData: { powerPoints } },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

function makeActor(items: unknown[], goodKarma = 0) {
    return {
        items,
        system: { karma: { goodKarma } },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

describe("getAdeptMagicItem / getPowerPointsAvailable", () => {
    it("finds the owned adept Magic item", () => {
        const magic = makeMagicItem("adept", 3);
        const actor = makeActor([magic]);
        expect(getAdeptMagicItem(actor as any)).toBe(magic);
        expect(getPowerPointsAvailable(actor as any)).toBe(3);
    });

    it("ignores a magician Magic item", () => {
        const actor = makeActor([makeMagicItem("magician", 3)]);
        expect(getAdeptMagicItem(actor as any)).toBeNull();
        expect(getPowerPointsAvailable(actor as any)).toBe(0);
    });

    it("returns null with no Magic item at all", () => {
        expect(getAdeptMagicItem(makeActor([]) as any)).toBeNull();
    });
});

describe("spendPowerPoints", () => {
    it("deducts and succeeds when affordable", async () => {
        const magic = makeMagicItem("adept", 5);
        const actor = makeActor([magic]);
        const ok = await spendPowerPoints(actor as any, 2);
        expect(ok).toBe(true);
        expect(magic.update).toHaveBeenCalledWith({ "system.adeptData.powerPoints": 3 }, { render: false });
    });

    it("blocks outright when unaffordable", async () => {
        const magic = makeMagicItem("adept", 1);
        const actor = makeActor([magic]);
        const ok = await spendPowerPoints(actor as any, 2);
        expect(ok).toBe(false);
        expect(magic.update).not.toHaveBeenCalled();
    });

    it("fails when the actor has no adept Magic item", async () => {
        const actor = makeActor([]);
        expect(await spendPowerPoints(actor as any, 1)).toBe(false);
    });
});

describe("buyPowerPoints", () => {
    it("deducts Good Karma and credits Power Points when affordable", async () => {
        const magic = makeMagicItem("adept", 1);
        const actor = makeActor([magic], GOOD_KARMA_PER_POWER_POINT * 3);
        const ok = await buyPowerPoints(actor as any, 2);
        expect(ok).toBe(true);
        expect(actor.update).toHaveBeenCalledWith({ "system.karma.goodKarma": GOOD_KARMA_PER_POWER_POINT }, { render: false });
        expect(magic.update).toHaveBeenCalledWith({ "system.adeptData.powerPoints": 3 }, { render: false });
    });

    it("blocks outright when Good Karma is insufficient", async () => {
        const magic = makeMagicItem("adept", 0);
        const actor = makeActor([magic], 10);
        const ok = await buyPowerPoints(actor as any, 1);
        expect(ok).toBe(false);
        expect(actor.update).not.toHaveBeenCalled();
        expect(magic.update).not.toHaveBeenCalled();
    });

    it("rejects a non-positive quantity", async () => {
        const actor = makeActor([makeMagicItem("adept", 0)], 1000);
        expect(await buyPowerPoints(actor as any, 0)).toBe(false);
    });
});
