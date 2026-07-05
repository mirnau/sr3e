const MODULE_ID = "sr3e";
const WINDOW_FOCUS_BLUR = "windowFocusBlurPx";
const WINDOW_FOCUS_SHRINK = "windowFocusShrink";
const WINDOW_FOCUS_SHRINK_PERCENT = "windowFocusShrinkPercent";
const WINDOW_FOCUS_OPACITY = "windowFocusOpacity";
const WINDOW_FOCUS_OPACITY_PERCENT = "windowFocusOpacityPercent";
const WINDOW_FOCUS_BLUR_VAR = "--sr3e-window-focus-blur";
const WINDOW_FOCUS_SCALE_VAR = "--sr3e-window-focus-scale";
const WINDOW_FOCUS_OPACITY_VAR = "--sr3e-window-focus-opacity";

export const DEFAULT_WINDOW_FOCUS_BLUR_PX = 2;
export const MIN_WINDOW_FOCUS_BLUR_PX = 0;
export const MAX_WINDOW_FOCUS_BLUR_PX = 10;
export const DEFAULT_WINDOW_FOCUS_SHRINK = true;
export const DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT = 95;
export const MIN_WINDOW_FOCUS_SHRINK_PERCENT = 25;
export const MAX_WINDOW_FOCUS_SHRINK_PERCENT = 99;
export const FULL_WINDOW_FOCUS_SCALE = 1;
export const DEFAULT_WINDOW_FOCUS_OPACITY = true;
export const DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT = 70;
export const MIN_WINDOW_FOCUS_OPACITY_PERCENT = 50;
export const MAX_WINDOW_FOCUS_OPACITY_PERCENT = 100;
export const FULL_WINDOW_FOCUS_OPACITY = 1;

export const windowFocusBlurSettingKeys = {
    moduleId: MODULE_ID,
    windowFocusBlur: WINDOW_FOCUS_BLUR,
    windowFocusShrink: WINDOW_FOCUS_SHRINK,
    windowFocusShrinkPercent: WINDOW_FOCUS_SHRINK_PERCENT,
    windowFocusOpacity: WINDOW_FOCUS_OPACITY,
    windowFocusOpacityPercent: WINDOW_FOCUS_OPACITY_PERCENT,
} as const;

export function normalizeWindowFocusBlur(value: unknown): number {
    const blur = Number(value);
    if (!Number.isFinite(blur)) return DEFAULT_WINDOW_FOCUS_BLUR_PX;
    return Math.max(MIN_WINDOW_FOCUS_BLUR_PX, Math.min(MAX_WINDOW_FOCUS_BLUR_PX, blur));
}

export function getWindowFocusBlur(): number {
    return normalizeWindowFocusBlur((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_BLUR));
}

export function normalizeWindowFocusShrinkPercent(value: unknown): number {
    const percent = Math.round(Number(value));
    if (!Number.isFinite(percent)) return DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT;
    return Math.max(MIN_WINDOW_FOCUS_SHRINK_PERCENT, Math.min(MAX_WINDOW_FOCUS_SHRINK_PERCENT, percent));
}

export function normalizeWindowFocusOpacityPercent(value: unknown): number {
    const percent = Math.round(Number(value));
    if (!Number.isFinite(percent)) return DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT;
    return Math.max(MIN_WINDOW_FOCUS_OPACITY_PERCENT, Math.min(MAX_WINDOW_FOCUS_OPACITY_PERCENT, percent));
}

export function windowFocusShrinkSetting(): boolean {
    return Boolean((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_SHRINK));
}

export function getWindowFocusShrinkPercent(): number {
    return normalizeWindowFocusShrinkPercent((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_SHRINK_PERCENT));
}

export function windowFocusOpacitySetting(): boolean {
    return Boolean((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_OPACITY));
}

export function getWindowFocusOpacityPercent(): number {
    return normalizeWindowFocusOpacityPercent((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_OPACITY_PERCENT));
}

export function applyWindowFocusBlur(value: unknown): void {
    document.documentElement.style.setProperty(WINDOW_FOCUS_BLUR_VAR, `${normalizeWindowFocusBlur(value)}px`);
}

export function applyWindowFocusShrink(enabled: boolean, percent: unknown): void {
    const scale = enabled ? normalizeWindowFocusShrinkPercent(percent) / 100 : FULL_WINDOW_FOCUS_SCALE;
    document.documentElement.style.setProperty(WINDOW_FOCUS_SCALE_VAR, String(scale));
}

export function applyWindowFocusOpacity(enabled: boolean, percent: unknown): void {
    const opacity = enabled ? normalizeWindowFocusOpacityPercent(percent) / 100 : FULL_WINDOW_FOCUS_OPACITY;
    document.documentElement.style.setProperty(WINDOW_FOCUS_OPACITY_VAR, String(opacity));
}
