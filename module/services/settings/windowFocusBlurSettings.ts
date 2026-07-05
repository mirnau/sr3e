import {
    applyWindowFocusBlur,
    DEFAULT_WINDOW_FOCUS_BLUR_PX,
    getWindowFocusBlur,
    MAX_WINDOW_FOCUS_BLUR_PX,
    MIN_WINDOW_FOCUS_BLUR_PX,
    windowFocusBlurSettingKeys,
} from "./windowFocusBlurRuntime";

export function registerWindowFocusBlurSettings(): void {
    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusBlur, {
        name: "Window Focus Blur",
        hint: "Blur applied to unfocused application windows. Set to 0px to disable blur.",
        scope: "world",
        config: true,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_BLUR_PX,
        range: { min: MIN_WINDOW_FOCUS_BLUR_PX, max: MAX_WINDOW_FOCUS_BLUR_PX, step: 1 },
        restricted: true,
        onChange: (value: number) => applyWindowFocusBlur(value),
    });
}

export function applyWindowFocusBlurSetting(): void {
    applyWindowFocusBlur(getWindowFocusBlur());
}
