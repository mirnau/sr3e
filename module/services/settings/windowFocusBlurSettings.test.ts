import { describe, expect, it } from "vitest";
import {
    DEFAULT_WINDOW_FOCUS_BLUR_PX,
    MAX_WINDOW_FOCUS_BLUR_PX,
    MIN_WINDOW_FOCUS_BLUR_PX,
    normalizeWindowFocusBlur,
} from "./windowFocusBlurRuntime";

describe("windowFocusBlurSettings", () => {
    it("defaults invalid values to 2px", () => {
        expect(normalizeWindowFocusBlur(undefined)).toBe(DEFAULT_WINDOW_FOCUS_BLUR_PX);
        expect(normalizeWindowFocusBlur("bad")).toBe(DEFAULT_WINDOW_FOCUS_BLUR_PX);
    });

    it("clamps values to the configured range", () => {
        expect(normalizeWindowFocusBlur(-1)).toBe(MIN_WINDOW_FOCUS_BLUR_PX);
        expect(normalizeWindowFocusBlur(6)).toBe(6);
        expect(normalizeWindowFocusBlur(11)).toBe(MAX_WINDOW_FOCUS_BLUR_PX);
    });
});
