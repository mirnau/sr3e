<script lang="ts">
import { localize } from "../../../services/utilities";
import LabeledNumberInput from "../../items/LabeledNumberInput.svelte";
import Foldout from "../actor-components/Foldout.svelte";

const p = $props<{ system: Record<string, any>; update: (path: string, value: number) => void }>();

const isDrone = $derived(p.system.category === "drone");
const isGround = $derived(p.system.vehicleType === "ground");
const isAviation = $derived(p.system.vehicleType === "aviation");
</script>

<Foldout label={localize(CONFIG.SR3E.MECHANICAL.performance)}>
    <div class="stat-grid two-column">
        {#if isGround}
            <LabeledNumberInput key="handlingRoad" label={localize(CONFIG.SR3E.MECHANICAL.handlingRoad)} value={p.system.handlingRoad?.value ?? p.system.handling?.value ?? 0} onUpdate={(v) => p.update("system.handlingRoad.value", v)} />
            <LabeledNumberInput key="handlingOffRoad" label={localize(CONFIG.SR3E.MECHANICAL.handlingOffRoad)} value={p.system.handlingOffRoad?.value ?? p.system.handling?.value ?? 0} onUpdate={(v) => p.update("system.handlingOffRoad.value", v)} />
        {:else}
            <LabeledNumberInput key="handling" label={localize(CONFIG.SR3E.MECHANICAL.handling)} value={p.system.handling?.value ?? 0} onUpdate={(v) => p.update("system.handling.value", v)} />
        {/if}
        {#if isAviation}
            <LabeledNumberInput key="speedMax" label={localize(CONFIG.SR3E.MECHANICAL.speedMax)} value={p.system.speedMax?.value ?? p.system.speed?.value ?? 0} onUpdate={(v) => p.update("system.speedMax.value", v)} />
            <LabeledNumberInput key="speedStall" label={localize(CONFIG.SR3E.MECHANICAL.speedStall)} value={p.system.speedStall?.value ?? 0} onUpdate={(v) => p.update("system.speedStall.value", v)} />
        {:else}
            <LabeledNumberInput key="speed" label={localize(CONFIG.SR3E.MECHANICAL.speed)} value={p.system.speed?.value ?? 0} onUpdate={(v) => p.update("system.speed.value", v)} />
        {/if}
        <LabeledNumberInput key="accel" label={localize(CONFIG.SR3E.MECHANICAL.accel)} value={p.system.accel?.value ?? 0} onUpdate={(v) => p.update("system.accel.value", v)} />
        <LabeledNumberInput key="body" label={localize(CONFIG.SR3E.MECHANICAL.body)} value={p.system.body?.value ?? 0} onUpdate={(v) => p.update("system.body.value", v)} />
        <LabeledNumberInput key="armor" label={localize(CONFIG.SR3E.MECHANICAL.armor)} value={p.system.armor?.value ?? 0} onUpdate={(v) => p.update("system.armor.value", v)} />
        <LabeledNumberInput key="signature" label={localize(CONFIG.SR3E.MECHANICAL.signature)} value={p.system.signature?.value ?? 0} onUpdate={(v) => p.update("system.signature.value", v)} />
        <LabeledNumberInput key="sensor" label={localize(CONFIG.SR3E.MECHANICAL.sensor)} value={p.system.sensor?.value ?? 0} onUpdate={(v) => p.update("system.sensor.value", v)} />
        <LabeledNumberInput key={isDrone ? "pilot" : "autonav"} label={localize(isDrone ? CONFIG.SR3E.MECHANICAL.pilot : CONFIG.SR3E.MECHANICAL.autonav)} value={isDrone ? (p.system.pilot?.value ?? 0) : (p.system.autonav?.value ?? 0)} onUpdate={(v) => p.update(isDrone ? "system.pilot.value" : "system.autonav.value", v)} />
        <LabeledNumberInput key="speedTurbo" label={localize(CONFIG.SR3E.MECHANICAL.speedTurbo)} value={p.system.speedTurbo?.value ?? 0} onUpdate={(v) => p.update("system.speedTurbo.value", v)} />
        <LabeledNumberInput key="accelTurbo" label={localize(CONFIG.SR3E.MECHANICAL.accelTurbo)} value={p.system.accelTurbo?.value ?? 0} onUpdate={(v) => p.update("system.accelTurbo.value", v)} />
    </div>
</Foldout>
