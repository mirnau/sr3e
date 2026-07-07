import WindowFocusBlurSettingsApp from "../../foundry/applications/WindowFocusBlurSettingsApp";
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
    windowFocusOpacitySetting,
    windowFocusShrinkSetting,
    windowFocusBlurSettingKeys,
} from "./windowFocusBlurRuntime";

export function registerWindowFocusBlurSettings(): void {
    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusBlur, {
        name: "Window Focus Blur",
        hint: "Blur applied to unfocused application windows. Set to 0px to disable blur.",
        scope: "client",
        config: false,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_BLUR_PX,
        onChange: (value: number) => applyWindowFocusBlur(value),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusShrink, {
        name: "Shrink Unfocused Windows",
        hint: "Scales unfocused application windows using the configured shrink percentage.",
        scope: "client",
        config: false,
        type: Boolean,
        default: DEFAULT_WINDOW_FOCUS_SHRINK,
        onChange: (enabled: boolean) => applyWindowFocusShrink(enabled, getWindowFocusShrinkPercent()),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusShrinkPercent, {
        name: "Unfocused Window Scale",
        hint: "Scale applied to unfocused application windows when shrink is enabled.",
        scope: "client",
        config: false,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT,
        onChange: (percent: number) => applyWindowFocusShrink(windowFocusShrinkSetting(), percent),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusOpacity, {
        name: "Fade Unfocused Windows",
        hint: "Applies opacity to unfocused application windows.",
        scope: "client",
        config: false,
        type: Boolean,
        default: DEFAULT_WINDOW_FOCUS_OPACITY,
        onChange: (enabled: boolean) => applyWindowFocusOpacity(enabled, getWindowFocusOpacityPercent()),
    });

    (game.settings as any).register(windowFocusBlurSettingKeys.moduleId, windowFocusBlurSettingKeys.windowFocusOpacityPercent, {
        name: "Unfocused Window Opacity",
        hint: "Opacity applied to unfocused application windows when fading is enabled.",
        scope: "client",
        config: false,
        type: Number,
        default: DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT,
        onChange: (percent: number) => applyWindowFocusOpacity(windowFocusOpacitySetting(), percent),
    });

    (game.settings as any).registerMenu(windowFocusBlurSettingKeys.moduleId, "windowFocusBlur", {
        name: "Window Focus Effects",
        label: "Configure",
        hint: "Adjust blur, shrink, and fade applied to unfocused application windows.",
        icon: "fas fa-window-restore",
        type: WindowFocusBlurSettingsApp,
    });
}

export function applyWindowFocusBlurSetting(): void {
    applyWindowFocusBlur(getWindowFocusBlur());
    applyWindowFocusShrink(windowFocusShrinkSetting(), getWindowFocusShrinkPercent());
    applyWindowFocusOpacity(windowFocusOpacitySetting(), getWindowFocusOpacityPercent());
}
