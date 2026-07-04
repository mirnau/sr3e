<script lang="ts">
import {
    DEFAULT_REM_SIZE_PX,
    MAX_REM_SIZE_PX,
    MIN_REM_SIZE_PX,
    getRemSize,
    resetRemSize,
    setRemSize,
} from "../../services/settings/remSizeRuntime";

let remSize = $state(getRemSize());

async function updateRemSize(value: unknown): Promise<void> {
    remSize = Number(value);
    await setRemSize(remSize);
    remSize = getRemSize();
}

async function reset(): Promise<void> {
    await resetRemSize();
    remSize = DEFAULT_REM_SIZE_PX;
}
</script>

<fieldset>
    <legend>System Scale</legend>
    <div class="form-group">
        <label for="sr3e-rem-size">REM Size</label>
        <div class="form-fields sr3e-rem-size-fields">
            <input
                id="sr3e-rem-size"
                type="range"
                min={MIN_REM_SIZE_PX}
                max={MAX_REM_SIZE_PX}
                step="1"
                value={remSize}
                oninput={(event) => updateRemSize((event.currentTarget as HTMLInputElement).value)}
            />
            <span>{remSize}px</span>
            <button type="button" onclick={reset}>Reset</button>
        </div>
        <p class="hint">Defines 1rem for SR3E UI. Default: {DEFAULT_REM_SIZE_PX}px.</p>
    </div>
</fieldset>

<style>
    .sr3e-rem-size-fields {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 3.5rem auto;
        align-items: center;
        gap: 0.5rem;
    }
</style>
