const MODULE_ID = "sr3e";
const WINDOW_FOCUS_BLUR = "windowFocusBlurPx";
const WINDOW_FOCUS_BLUR_VAR = "--sr3e-window-focus-blur";

export const DEFAULT_WINDOW_FOCUS_BLUR_PX = 2;
export const MIN_WINDOW_FOCUS_BLUR_PX = 0;
export const MAX_WINDOW_FOCUS_BLUR_PX = 10;

export const windowFocusBlurSettingKeys = {
    moduleId: MODULE_ID,
    windowFocusBlur: WINDOW_FOCUS_BLUR,
} as const;

export function normalizeWindowFocusBlur(value: unknown): number {
    const blur = Number(value);
    if (!Number.isFinite(blur)) return DEFAULT_WINDOW_FOCUS_BLUR_PX;
    return Math.max(MIN_WINDOW_FOCUS_BLUR_PX, Math.min(MAX_WINDOW_FOCUS_BLUR_PX, blur));
}

export function getWindowFocusBlur(): number {
    return normalizeWindowFocusBlur((game.settings as any).get(MODULE_ID, WINDOW_FOCUS_BLUR));
}

export function applyWindowFocusBlur(value: unknown): void {
    document.documentElement.style.setProperty(WINDOW_FOCUS_BLUR_VAR, `${normalizeWindowFocusBlur(value)}px`);
}
