import { describe, it, expect } from "vitest";
import {
    boxesForLevel,
    splitDamageType,
    stageStep,
    applyAttackStaging,
    applyResistanceStaging,
    computeResistanceTN,
} from "./damageMath";

describe("boxesForLevel", () => {
    it("maps each step correctly", () => {
        expect(boxesForLevel("l")).toBe(1);
        expect(boxesForLevel("m")).toBe(3);
        expect(boxesForLevel("s")).toBe(6);
        expect(boxesForLevel("d")).toBe(10);
    });
});

describe("splitDamageType", () => {
    it("detects stun track", () => {
        expect(splitDamageType("mstun")).toEqual({ step: "m", track: "stun" });
        expect(splitDamageType("lstun")).toEqual({ step: "l", track: "stun" });
    });
    it("defaults to physical", () => {
        expect(splitDamageType("s")).toEqual({ step: "s", track: "physical" });
        expect(splitDamageType("d")).toEqual({ step: "d", track: "physical" });
    });
});

describe("stageStep", () => {
    it("stages up", () => expect(stageStep("l", 2)).toBe("s"));
    it("stages down", () => expect(stageStep("s", -1)).toBe("m"));
    it("returns null when staged off", () => expect(stageStep("l", -1)).toBeNull());
    it("clamps at d", () => expect(stageStep("d", 5)).toBe("d"));
});

describe("applyAttackStaging", () => {
    it("no successes = no change", () => expect(applyAttackStaging("m", 0)).toBe("m"));
    it("2 successes = +1 stage", () => expect(applyAttackStaging("m", 2)).toBe("s"));
    it("3 successes = +1 stage", () => expect(applyAttackStaging("m", 3)).toBe("s"));
    it("4 successes = +2 stages", () => expect(applyAttackStaging("m", 4)).toBe("d"));
    it("clamps at d not null", () => expect(applyAttackStaging("d", 6)).toBe("d"));
});

describe("applyResistanceStaging", () => {
    it("2 successes = −1 stage", () => expect(applyResistanceStaging("s", 2)).toBe("m"));
    it("staged off returns null", () => expect(applyResistanceStaging("l", 2)).toBeNull());
    it("0 successes = no change", () => expect(applyResistanceStaging("m", 0)).toBe("m"));
});

describe("computeResistanceTN", () => {
    it("standard case", () => expect(computeResistanceTN(8, 4)).toBe(4));
    it("floors at 2", () => expect(computeResistanceTN(4, 10)).toBe(2));
    it("resistTNAdd applied", () => expect(computeResistanceTN(6, 4, 2)).toBe(4));
});
