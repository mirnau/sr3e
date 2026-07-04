<script lang="ts">
import {
    getSheetColor,
    resetSheetColor,
    setSheetColor,
    sheetColorDefinitions,
} from "../../services/settings/sheetColorRuntime";
import type { SheetColorDefinition } from "../../services/settings/sheetColorRuntime";

type ColorPickerElement = HTMLElement & { value?: string };

let colors = $state(Object.fromEntries(
    sheetColorDefinitions.map((definition) => [definition.key, getSheetColor(definition)]),
));

async function updateColor(definition: SheetColorDefinition, value: string) {
    colors = { ...colors, [definition.key]: value };
    await setSheetColor(definition, value);
}

async function reset(definition: SheetColorDefinition) {
    await resetSheetColor(definition);
    colors = { ...colors, [definition.key]: definition.defaultColor };
}

function colorFromEvent(event: Event, fallback: string): string { return String((event.currentTarget as ColorPickerElement).value ?? fallback); }
</script>

<fieldset>
    <legend>Sheet Colors</legend>
    {#each sheetColorDefinitions as definition}
        <div class="form-group">
            <label for={`sr3e-${definition.key}`}>{definition.label}</label>
            <div class="form-fields">
                <svelte:element
                    this={"color-picker"}
                    id={`sr3e-${definition.key}`}
                    name={definition.setting}
                    value={colors[definition.key]}
                    onchange={(event) => updateColor(definition, colorFromEvent(event, colors[definition.key]))}
                    oninput={(event) => updateColor(definition, colorFromEvent(event, colors[definition.key]))}
                />
                <button type="button" onclick={() => reset(definition)}>Reset</button>
            </div>
            <p class="hint">{definition.hint} Default: {definition.defaultColor}</p>
        </div>
    {/each}
</fieldset>
