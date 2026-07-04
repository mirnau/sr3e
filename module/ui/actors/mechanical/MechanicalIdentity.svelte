<script lang="ts">
import { localize } from "../../../services/utilities";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import LabeledTextInput from "../../items/LabeledTextInput.svelte";

const p = $props<{ system: Record<string, any>; update: (path: string, value: string | number | boolean) => void }>();

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

const categoryOptions = $derived(kvOptions(CONFIG.SR3E.MECHANICAL_CATEGORIES));
const typeOptions = $derived(kvOptions(CONFIG.SR3E.VEHICLE_TYPES));
const powerOptions = $derived(kvOptions(CONFIG.SR3E.POWER_SOURCES));
const landingOptions = $derived(kvOptions(CONFIG.SR3E.LANDING_TAKEOFF));
const showLanding = $derived(["fixedWing", "rotor", "vectoredThrust", "lta", "tBird", "drone"].includes(p.system.category));
</script>

<h3>{localize(CONFIG.SR3E.MECHANICAL.mechanical)}</h3>
<div class="stat-grid single-column">
    <LabeledDropdown key="vehicleType" label={localize(CONFIG.SR3E.MECHANICAL.vehicleType)} value={p.system.vehicleType ?? "ground"} options={typeOptions} onUpdate={(v) => p.update("system.vehicleType", v)} />
    <LabeledDropdown key="category" label={localize(CONFIG.SR3E.MECHANICAL.category)} value={p.system.category} options={categoryOptions} onUpdate={(v) => p.update("system.category", v)} />
    <LabeledDropdown key="power" label={localize(CONFIG.SR3E.MECHANICAL.power)} value={p.system.power} options={powerOptions} onUpdate={(v) => p.update("system.power", v)} />
    {#if showLanding}
        <LabeledDropdown key="landingTakeoff" label={localize(CONFIG.SR3E.MECHANICAL.landingTakeoff)} value={p.system.landingTakeoff ?? ""} options={landingOptions} onUpdate={(v) => p.update("system.landingTakeoff", v)} />
    {/if}
    <LabeledTextInput key="seating" label={localize(CONFIG.SR3E.MECHANICAL.seating)} value={p.system.seating ?? ""} onUpdate={(v) => p.update("system.seating", v)} />
    <LabeledTextInput key="entryPoints" label={localize(CONFIG.SR3E.MECHANICAL.entryPoints)} value={p.system.entryPoints ?? ""} onUpdate={(v) => p.update("system.entryPoints", v)} />
    <LabeledBoolean key="riggerAdaptation" label={localize(CONFIG.SR3E.MECHANICAL.riggerAdaptation)} value={p.system.riggerAdaptation ?? false} onUpdate={(v) => p.update("system.riggerAdaptation", v)} />
    <LabeledBoolean key="remoteControlInterface" label={localize(CONFIG.SR3E.MECHANICAL.remoteControlInterface)} value={p.system.remoteControlInterface ?? false} onUpdate={(v) => p.update("system.remoteControlInterface", v)} />
</div>
