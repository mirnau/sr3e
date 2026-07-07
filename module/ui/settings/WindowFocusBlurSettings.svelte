<script lang="ts">
import {
    DEFAULT_WINDOW_FOCUS_BLUR_PX,
    DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT,
    DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT,
    MAX_WINDOW_FOCUS_BLUR_PX,
    MAX_WINDOW_FOCUS_OPACITY_PERCENT,
    MAX_WINDOW_FOCUS_SHRINK_PERCENT,
    MIN_WINDOW_FOCUS_BLUR_PX,
    MIN_WINDOW_FOCUS_OPACITY_PERCENT,
    MIN_WINDOW_FOCUS_SHRINK_PERCENT,
    getWindowFocusBlur,
    getWindowFocusOpacityPercent,
    getWindowFocusShrinkPercent,
    resetWindowFocusBlur,
    setWindowFocusBlur,
    setWindowFocusOpacity,
    setWindowFocusOpacityPercent,
    setWindowFocusShrink,
    setWindowFocusShrinkPercent,
    windowFocusOpacitySetting,
    windowFocusShrinkSetting,
} from "../../services/settings/windowFocusBlurRuntime";

let blurPx = $state(getWindowFocusBlur());
let shrinkEnabled = $state(windowFocusShrinkSetting());
let shrinkPercent = $state(getWindowFocusShrinkPercent());
let opacityEnabled = $state(windowFocusOpacitySetting());
let opacityPercent = $state(getWindowFocusOpacityPercent());

async function updateBlur(value: unknown): Promise<void> {
    blurPx = Number(value);
    await setWindowFocusBlur(blurPx);
    blurPx = getWindowFocusBlur();
}

async function resetBlur(): Promise<void> {
    await resetWindowFocusBlur();
    blurPx = DEFAULT_WINDOW_FOCUS_BLUR_PX;
}

async function updateShrinkEnabled(value: boolean): Promise<void> {
    shrinkEnabled = value;
    await setWindowFocusShrink(shrinkEnabled);
}

async function updateShrinkPercent(value: unknown): Promise<void> {
    shrinkPercent = Number(value);
    await setWindowFocusShrinkPercent(shrinkPercent);
    shrinkPercent = getWindowFocusShrinkPercent();
}

async function updateOpacityEnabled(value: boolean): Promise<void> {
    opacityEnabled = value;
    await setWindowFocusOpacity(opacityEnabled);
}

async function updateOpacityPercent(value: unknown): Promise<void> {
    opacityPercent = Number(value);
    await setWindowFocusOpacityPercent(opacityPercent);
    opacityPercent = getWindowFocusOpacityPercent();
}
</script>

<fieldset>
    <legend>Window Focus Effects</legend>

    <div class="form-group">
        <label for="sr3e-window-focus-blur">Blur</label>
        <div class="form-fields sr3e-window-focus-fields">
            <input
                id="sr3e-window-focus-blur"
                type="range"
                min={MIN_WINDOW_FOCUS_BLUR_PX}
                max={MAX_WINDOW_FOCUS_BLUR_PX}
                step="1"
                value={blurPx}
                oninput={(event) => updateBlur((event.currentTarget as HTMLInputElement).value)}
            />
            <span>{blurPx}px</span>
            <button type="button" onclick={resetBlur}>Reset</button>
        </div>
        <p class="hint">Blur applied to unfocused application windows. Set to 0px to disable blur.</p>
    </div>

    <div class="form-group">
        <label for="sr3e-window-focus-shrink-enabled">Shrink Unfocused Windows</label>
        <div class="form-fields">
            <input
                id="sr3e-window-focus-shrink-enabled"
                type="checkbox"
                checked={shrinkEnabled}
                onchange={(event) => updateShrinkEnabled((event.currentTarget as HTMLInputElement).checked)}
            />
        </div>
    </div>

    <div class="form-group">
        <label for="sr3e-window-focus-shrink-percent">Unfocused Window Scale</label>
        <div class="form-fields sr3e-window-focus-fields">
            <input
                id="sr3e-window-focus-shrink-percent"
                type="range"
                min={MIN_WINDOW_FOCUS_SHRINK_PERCENT}
                max={MAX_WINDOW_FOCUS_SHRINK_PERCENT}
                step="1"
                value={shrinkPercent}
                oninput={(event) => updateShrinkPercent((event.currentTarget as HTMLInputElement).value)}
            />
            <span>{shrinkPercent}%</span>
        </div>
        <p class="hint">Scale applied to unfocused application windows when shrink is enabled. Default: {DEFAULT_WINDOW_FOCUS_SHRINK_PERCENT}%.</p>
    </div>

    <div class="form-group">
        <label for="sr3e-window-focus-opacity-enabled">Fade Unfocused Windows</label>
        <div class="form-fields">
            <input
                id="sr3e-window-focus-opacity-enabled"
                type="checkbox"
                checked={opacityEnabled}
                onchange={(event) => updateOpacityEnabled((event.currentTarget as HTMLInputElement).checked)}
            />
        </div>
    </div>

    <div class="form-group">
        <label for="sr3e-window-focus-opacity-percent">Unfocused Window Opacity</label>
        <div class="form-fields sr3e-window-focus-fields">
            <input
                id="sr3e-window-focus-opacity-percent"
                type="range"
                min={MIN_WINDOW_FOCUS_OPACITY_PERCENT}
                max={MAX_WINDOW_FOCUS_OPACITY_PERCENT}
                step="1"
                value={opacityPercent}
                oninput={(event) => updateOpacityPercent((event.currentTarget as HTMLInputElement).value)}
            />
            <span>{opacityPercent}%</span>
        </div>
        <p class="hint">Opacity applied to unfocused application windows when fading is enabled. Default: {DEFAULT_WINDOW_FOCUS_OPACITY_PERCENT}%.</p>
    </div>
</fieldset>
