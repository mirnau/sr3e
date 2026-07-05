// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
    DEFAULT_WINDOW_FOCUS_BLUR_PX,
    DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT,
    DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT,
    FULL_WINDOW_FOCUS_OPACITY,
    FULL_WINDOW_FOCUS_SCALE,
    MAX_WINDOW_FOCUS_BLUR_PX,
    MAX_WINDOW_FOCUS_OPACITY_PERCENT,
    MAX_WINDOW_FOCUS_SHRINK_PERCENT,
    MIN_WINDOW_FOCUS_BLUR_PX,
    MIN_WINDOW_FOCUS_OPACITY_PERCENT,
    MIN_WINDOW_FOCUS_SHRINK_PERCENT,
    applyWindowFocusOpacity,
    normalizeWindowFocusBlur,
    normalizeWindowFocusOpacityPercent,
    normalizeWindowFocusShrinkPercent,
    applyWindowFocusShrink,
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

    it("defaults invalid shrink percent to 95", () => {
        expect(normalizeWindowFocusShrinkPercent(undefined)).toBe(DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT);
        expect(normalizeWindowFocusShrinkPercent("bad")).toBe(DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT);
    });

    it("rounds and clamps shrink percent to the configured range", () => {
        expect(normalizeWindowFocusShrinkPercent(24)).toBe(MIN_WINDOW_FOCUS_SHRINK_PERCENT);
        expect(normalizeWindowFocusShrinkPercent(94.6)).toBe(95);
        expect(normalizeWindowFocusShrinkPercent(100)).toBe(MAX_WINDOW_FOCUS_SHRINK_PERCENT);
    });

    it("defaults invalid opacity percent to 70", () => {
        expect(normalizeWindowFocusOpacityPercent(undefined)).toBe(DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT);
        expect(normalizeWindowFocusOpacityPercent("bad")).toBe(DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT);
    });

    it("rounds and clamps opacity percent to the configured range", () => {
        expect(normalizeWindowFocusOpacityPercent(49)).toBe(MIN_WINDOW_FOCUS_OPACITY_PERCENT);
        expect(normalizeWindowFocusOpacityPercent(70.4)).toBe(70);
        expect(normalizeWindowFocusOpacityPercent(101)).toBe(MAX_WINDOW_FOCUS_OPACITY_PERCENT);
    });

    it("applies shrink scale through a css variable", () => {
        applyWindowFocusShrink(true, 95);
        expect(document.documentElement.style.getPropertyValue("--sr3e-window-focus-scale")).toBe("0.95");

        applyWindowFocusShrink(false, 25);
        expect(document.documentElement.style.getPropertyValue("--sr3e-window-focus-scale")).toBe(String(FULL_WINDOW_FOCUS_SCALE));
    });

    it("applies opacity through a css variable", () => {
        applyWindowFocusOpacity(true, 70);
        expect(document.documentElement.style.getPropertyValue("--sr3e-window-focus-opacity")).toBe("0.7");

        applyWindowFocusOpacity(false, 50);
        expect(document.documentElement.style.getPropertyValue("--sr3e-window-focus-opacity")).toBe(String(FULL_WINDOW_FOCUS_OPACITY));
    });
});
