import { describe, it, expect, beforeEach } from "vitest";
import { registerProcedure, getProcedure, listKinds, _resetForTest } from "./procedureRegistry";
import type { CombatResult } from "./types";

const stub = () => Promise.resolve({} as CombatResult);

beforeEach(() => _resetForTest());

describe("registerProcedure", () => {
    it("registers successfully", () => { registerProcedure("skill", stub); expect(listKinds()).toContain("skill"); });
    it("throws on duplicate", () => {
        registerProcedure("skill", stub);
        expect(() => registerProcedure("skill", stub)).toThrow(/already registered/);
    });
});

describe("getProcedure", () => {
    it("returns registered builder", () => { registerProcedure("skill", stub); expect(getProcedure("skill")).toBe(stub); });
    it("throws on missing kind", () => { expect(() => getProcedure("missing")).toThrow(/No procedure registered/); });
});

describe("listKinds", () => {
    it("empty initially", () => expect(listKinds()).toHaveLength(0));
    it("lists all registered", () => {
        registerProcedure("a", stub); registerProcedure("b", stub);
        expect(listKinds()).toEqual(["a", "b"]);
    });
});
