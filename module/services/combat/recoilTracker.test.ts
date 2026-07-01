import { describe, it, expect, beforeEach } from "vitest";
import {
    bumpPhaseShots, getPhaseShots, bumpOOCShots, getOOCShots,
    resetRecoil, recoilModifier,
} from "./recoilTracker";

const weapon = (mode: string, category = "standard") => ({ system: { mode, category } });

beforeEach(() => resetRecoil("test"));

describe("phase shots", () => {
    it("starts at 0", () => expect(getPhaseShots("test")).toBe(0));
    it("bumps", () => { bumpPhaseShots("test", 3); expect(getPhaseShots("test")).toBe(3); });
});

describe("OOC shots", () => {
    it("accumulates within window", () => {
        bumpOOCShots("test", 2);
        expect(getOOCShots("test")).toBe(2);
    });
});

describe("recoilModifier — semiauto (OOC context)", () => {
    it("first shot no recoil", () => {
        expect(recoilModifier("test", weapon("semiauto"), 1)).toBeNull();
    });
    it("second shot +1", () => {
        bumpOOCShots("test", 1);
        expect(recoilModifier("test", weapon("semiauto"), 1)?.value).toBe(1);
    });
});

describe("recoilModifier — burst (OOC context)", () => {
    it("first burst +3", () => {
        expect(recoilModifier("test", weapon("burst"), 3)?.value).toBe(3);
    });
    it("second burst cumulative: prior=3, penalty=6", () => {
        bumpOOCShots("test", 3);
        expect(recoilModifier("test", weapon("burst"), 3)?.value).toBe(6);
    });
    it("short burst (2 rounds) → +2", () => {
        expect(recoilModifier("test", weapon("burst"), 2)?.value).toBe(2);
    });
});

describe("recoilModifier — fullauto (OOC context)", () => {
    it("6 prior rounds → +6", () => {
        bumpOOCShots("test", 6);
        expect(recoilModifier("test", weapon("fullauto"), 4)?.value).toBe(6);
    });
});

describe("recoilModifier — heavy weapon doubling", () => {
    it("burst heavy = ×2", () => {
        expect(recoilModifier("test", weapon("burst", "heavy"), 3)?.value).toBe(6);
    });
});

describe("recoilModifier — manual", () => {
    it("always null", () => expect(recoilModifier("test", weapon("manual"), 1)).toBeNull());
});

describe("recoilModifier — energy", () => {
    it("always null", () => expect(recoilModifier("test", weapon("energy"), 1)).toBeNull());
});
