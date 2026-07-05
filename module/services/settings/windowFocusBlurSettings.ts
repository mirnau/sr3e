import {
    applyWindowFocusBlur,
    applyWindowFocusOpacity,
    applyWindowFocusShrink,
    DEFAULT_WINDOW_FOCUS_BLUR_PX,
    DEFAULT_WINDOW_FOCUS_OPACITY,
    DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT,
    DEFAULT_WINDOW_FOCUS_SHRINK,
    DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT,
    getWindowFocusBlur,
    getWindowFocusOpacityPercent,
    getWindowFocusShrinkPercent,
    MAX_WINDOW_FOCUS_BLUR_PX,
    MAX_WINDOW_FOCUS_OPACITY_PERCENT,
    MAX_WINDOW_FOCUS_SHRINK_PERCENT,
    MIN_WINDOW_FOCUS_BLUR_PX,
    MIN_WINDOW_FOCUS_OPACITY_PERCENT,
    MIN_WINDOW_FOCUS_SHRINK_PERCENT,
    windowFocusOpacitySetting,
    windowFocusShrinkSetting,
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

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusShrink, {
        name: "Shrink Unfocused Windows",
        hint: "Scales unfocused application windows using the configured shrink percentage.",
        scope: "world",
        config: true,
        type: Boolean,
        default: DEFAULT_WINDOW_FOCUS_SHRINK,
        restricted: true,
        onChange: (enabled: boolean) => applyWindowFocusShrink(enabled, getWindowFocusShrinkPercent()),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusShrinkPercent, {
        name: "Unfocused Window Scale",
        hint: "Scale applied to unfocused application windows when shrink is enabled.",
        scope: "world",
        config: true,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT,
        range: { min: MIN_WINDOW_FOCUS_SHRINK_PERCENT, max: MAX_WINDOW_FOCUS_SHRINK_PERCENT, step: 1 },
        restricted: true,
        onChange: (percent: number) => applyWindowFocusShrink(windowFocusShrinkSetting(), percent),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusOpacity, {
        name: "Fade Unfocused Windows",
        hint: "Applies opacity to unfocused application windows.",
        scope: "world",
        config: true,
        type: Boolean,
        default: DEFAULT_WINDOW_FOCUS_OPACITY,
        restricted: true,
        onChange: (enabled: boolean) => applyWindowFocusOpacity(enabled, getWindowFocusOpacityPercent()),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusOpacityPercent, {
        name: "Unfocused Window Opacity",
        hint: "Opacity applied to unfocused application windows when fading is enabled.",
        scope: "world",
        config: true,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT,
        range: { min: MIN_WINDOW_FOCUS_OPACITY_PERCENT, max: MAX_WINDOW_FOCUS_OPACITY_PERCENT, step: 1 },
        restricted: true,
        onChange: (percent: number) => applyWindowFocusOpacity(windowFocusOpacitySetting(), percent),
    });
}

export function applyWindowFocusBlurSetting(): void {
    applyWindowFocusBlur(getWindowFocusBlur());
    applyWindowFocusShrink(windowFocusShrinkSetting(), getWindowFocusShrinkPercent());
    applyWindowFocusOpacity(windowFocusOpacitySetting(), getWindowFocusOpacityPercent());
}
