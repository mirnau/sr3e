<script lang="ts">
import { disableFakeShadowsSetting, setDisableFakeShadows } from "../../services/settings/sheetColorRuntime";
import { disableEcgSetting, setDisableEcg } from "../../services/settings/healthAnimationRuntime";

let fakeShadowsDisabled = $state(disableFakeShadowsSetting());
let ecgDisabled = $state(disableEcgSetting());

async function updateFakeShadowsDisabled(value: boolean): Promise<void> {
    fakeShadowsDisabled = value;
    await setDisableFakeShadows(fakeShadowsDisabled);
}

async function updateEcgDisabled(value: boolean): Promise<void> {
    ecgDisabled = value;
    await setDisableEcg(ecgDisabled);
}
</script>

<fieldset>
    <legend>Performance Impacting Settings</legend>

    <div class="form-group">
        <label for="sr3e-disable-fake-shadows">Disable Sheet Glow Shadows</label>
        <div class="form-fields">
            <input
                id="sr3e-disable-fake-shadows"
                type="checkbox"
                checked={fakeShadowsDisabled}
                onchange={(event) => updateFakeShadowsDisabled((event.currentTarget as HTMLInputElement).checked)}
            />
        </div>
        <p class="hint">Stops the blurred rotating glow layer behind sheet cards and chat messages. Improves performance on low-spec devices.</p>
    </div>

    <div class="form-group">
        <label for="sr3e-disable-ecg">Disable ECG Animation</label>
        <div class="form-fields">
            <input
                id="sr3e-disable-ecg"
                type="checkbox"
                checked={ecgDisabled}
                onchange={(event) => updateEcgDisabled((event.currentTarget as HTMLInputElement).checked)}
            />
        </div>
        <p class="hint">Hides the animated heartbeat monitor on character sheets and stops its canvas rendering. Health penalty still applies as normal.</p>
    </div>
</fieldset>
