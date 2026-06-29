import { describe, it, expect, vi, afterEach } from "vitest";
import * as engine from "./sr3eDiceEngine";

function mockRoll(...faces: number[]) {
    let i = 0;
    vi.spyOn(Math, "random").mockImplementation(() => (faces[i++ % faces.length]! - 1) / 6);
}

afterEach(() => vi.restoreAllMocks());

describe("accumulate", () => {
    it("pool=0 returns empty array", () => {
        expect(engine.accumulate(0, 4)).toEqual([]);
    });

    it("non-6 first roll never explodes", () => {
        mockRoll(3);
        const [r] = engine.accumulate(1, 4);
        expect(r).toEqual({ result: 3, total: 3, active: true, exploded: false });
    });

    it("cap=Infinity: 6→6→3 accumulates to 15, exploded=true", () => {
        mockRoll(6, 6, 3);
        const [r] = engine.accumulate(1, Infinity);
        expect(r).toEqual({ result: 3, total: 15, active: true, exploded: true });
    });

    it("cap=4: first roll=6, total=6≥4 → stops immediately, exploded=false", () => {
        mockRoll(6);
        const [r] = engine.accumulate(1, 4);
        expect(r).toEqual({ result: 6, total: 6, active: true, exploded: false });
    });

    it("cap=8: 6→6 = 12, stops when total≥cap on second roll, exploded=true", () => {
        mockRoll(6, 6, 3);
        const [r] = engine.accumulate(1, 8);
        expect(r).toEqual({ result: 6, total: 12, active: true, exploded: true });
    });

    it("cap=8: 6→1 = 7 < 8, stops (non-6), exploded=true", () => {
        mockRoll(6, 1);
        const [r] = engine.accumulate(1, 8);
        expect(r).toEqual({ result: 1, total: 7, active: true, exploded: true });
    });

    it("cap=Infinity: single 6 chains once then stops on non-6", () => {
        mockRoll(6, 4);
        const [r] = engine.accumulate(1, Infinity);
        expect(r).toEqual({ result: 4, total: 10, active: true, exploded: true });
    });

    it("returns one result per die in pool", () => {
        mockRoll(3, 5, 2);
        const results = engine.accumulate(3, 4);
        expect(results).toHaveLength(3);
        expect(results.every(r => r.active === true)).toBe(true);
    });

    it("active is always true", () => {
        mockRoll(1, 2, 3, 4, 5);
        const results = engine.accumulate(5, 6);
        expect(results.every(r => r.active)).toBe(true);
    });
});
