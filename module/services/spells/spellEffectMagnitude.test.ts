import { describe, expect, it } from "vitest";
import {
    attributeModPerTwo,
    barrierStep,
    computeEffectMagnitude,
    detectionRange,
    levitateSpeed,
    magicFingers,
    permanentTimeDivisor,
    tnPerSuccess,
    tnPerSuccessCapped8,
    tnPerTwoSuccesses,
} from "./spellEffectMagnitude";

describe("attributeModPerTwo (SR3 p.193-194)", () => {
    it("gives 1 point per 2 successes", () => {
        expect(attributeModPerTwo({ force: 6, successes: 4, magic: 6 })).toBe(2);
    });

    it("caps at Force", () => {
        expect(attributeModPerTwo({ force: 3, successes: 10, magic: 6 })).toBe(3);
    });
});

describe("tnPerSuccess — Confusion (SR3 p.195)", () => {
    it("gives +1 TN per success", () => {
        expect(tnPerSuccess({ force: 6, successes: 3, magic: 6 })).toBe(3);
    });

    it("caps at Force", () => {
        expect(tnPerSuccess({ force: 4, successes: 7, magic: 6 })).toBe(4);
    });
});

describe("tnPerSuccessCapped8 — Shadow (SR3 p.198)", () => {
    it("caps at the lower of successes, 8, and Force", () => {
        expect(tnPerSuccessCapped8({ force: 10, successes: 12, magic: 6 })).toBe(8);
        expect(tnPerSuccessCapped8({ force: 3, successes: 12, magic: 6 })).toBe(3);
        expect(tnPerSuccessCapped8({ force: 10, successes: 5, magic: 6 })).toBe(5);
    });
});

describe("tnPerTwoSuccesses — Ice Sheet (SR3 p.198)", () => {
    it("gives +1 TN per 2 successes, capped by Force", () => {
        expect(tnPerTwoSuccesses({ force: 6, successes: 5, magic: 6 })).toBe(2);
        expect(tnPerTwoSuccesses({ force: 1, successes: 5, magic: 6 })).toBe(1);
    });
});

describe("barrierStep — Physical/Astral Barrier (SR3 p.198)", () => {
    it("sets rating to Force on the first success", () => {
        expect(barrierStep({ force: 4, successes: 1, magic: 6 })).toBe(4);
    });

    it("adds 1 rating per 2 additional net successes", () => {
        expect(barrierStep({ force: 4, successes: 3, magic: 6 })).toBe(5);
        expect(barrierStep({ force: 4, successes: 5, magic: 6 })).toBe(6);
    });

    it("gives 0 rating with no successes", () => {
        expect(barrierStep({ force: 4, successes: 0, magic: 6 })).toBe(0);
    });
});

describe("levitateSpeed (SR3 p.197)", () => {
    it("multiplies Magic by successes capped at Force", () => {
        expect(levitateSpeed({ force: 5, successes: 3, magic: 6 })).toBe(18);
    });

    it("caps the successes term at Force", () => {
        expect(levitateSpeed({ force: 2, successes: 5, magic: 6 })).toBe(12);
    });
});

describe("magicFingers (SR3 p.197)", () => {
    it("uses successes capped by Force for effective Strength/Quickness", () => {
        expect(magicFingers({ force: 4, successes: 2, magic: 6 })).toBe(2);
        expect(magicFingers({ force: 2, successes: 5, magic: 6 })).toBe(2);
    });
});

describe("detectionRange (SR3 p.192)", () => {
    it("is Force times Magic in meters", () => {
        expect(detectionRange({ force: 5, successes: 0, magic: 6 })).toBe(30);
    });
});

describe("permanentTimeDivisor (SR3 p.194, p.178)", () => {
    it("divides base time by successes", () => {
        expect(permanentTimeDivisor({ force: 4, successes: 2, magic: 6, baseTimeTurns: 10 })).toBe(5);
    });

    it("does not divide by zero", () => {
        expect(permanentTimeDivisor({ force: 4, successes: 0, magic: 6, baseTimeTurns: 10 })).toBe(10);
    });
});

describe("computeEffectMagnitude", () => {
    it("dispatches by algorithm key", () => {
        expect(computeEffectMagnitude("attributeModPerTwo", { force: 6, successes: 4, magic: 6 })).toBe(2);
        expect(computeEffectMagnitude("detectionRange", { force: 5, successes: 0, magic: 6 })).toBe(30);
    });
});
