import { describe, expect, it } from "vitest";
import {
    DEFAULT_REM_SIZE_PX,
    MAX_REM_SIZE_PX,
    MIN_REM_SIZE_PX,
    normalizeRemSize,
} from "./remSizeRuntime";

describe("remSizeSettings", () => {
    it("defaults invalid values to 16px", () => {
        expect(normalizeRemSize(undefined)).toBe(DEFAULT_REM_SIZE_PX);
        expect(normalizeRemSize("bad")).toBe(DEFAULT_REM_SIZE_PX);
    });

    it("rounds and clamps values to the configured range", () => {
        expect(normalizeRemSize(7)).toBe(MIN_REM_SIZE_PX);
        expect(normalizeRemSize(20.6)).toBe(21);
        expect(normalizeRemSize(40)).toBe(MAX_REM_SIZE_PX);
    });
});
