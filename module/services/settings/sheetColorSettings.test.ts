import { describe, expect, it } from "vitest";
import { DEFAULT_NEON_NAME_COLOR, normalizeHexColor } from "./sheetColorRuntime";

describe("sheetColorSettings", () => {
    it("accepts six-digit hex colors", () => {
        expect(normalizeHexColor("#A1b2C3")).toBe("#a1b2c3");
    });

    it("falls back to the neon pink default for invalid values", () => {
        expect(normalizeHexColor("rgb(255, 32, 144)")).toBe(DEFAULT_NEON_NAME_COLOR);
        expect(normalizeHexColor("#fff")).toBe(DEFAULT_NEON_NAME_COLOR);
    });
});
