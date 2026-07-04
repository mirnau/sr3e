<script lang="ts">
import { localize } from "../../../services/utilities";
import LabeledNumberInput from "../../items/LabeledNumberInput.svelte";
import Foldout from "../actor-components/Foldout.svelte";

const p = $props<{ mounts: Record<string, any>; update: (path: string, value: number) => void }>();
</script>

<Foldout label={localize(CONFIG.SR3E.MECHANICAL.mountsTitle)}>
    <div class="stat-grid two-column">
        <LabeledNumberInput key="firmpoints" label={localize(CONFIG.SR3E.MECHANICAL.firmpoints)} value={p.mounts?.firmpoints?.value ?? 0} onUpdate={(v) => p.update("system.mounts.firmpoints.value", v)} />
        <LabeledNumberInput key="hardpoints" label={localize(CONFIG.SR3E.MECHANICAL.hardpoints)} value={p.mounts?.hardpoints?.value ?? 0} onUpdate={(v) => p.update("system.mounts.hardpoints.value", v)} />
        <LabeledNumberInput key="turrets" label={localize(CONFIG.SR3E.MECHANICAL.turrets)} value={p.mounts?.turrets?.value ?? 0} onUpdate={(v) => p.update("system.mounts.turrets.value", v)} />
        <LabeledNumberInput key="externalFixed" label={localize(CONFIG.SR3E.MECHANICAL.externalFixed)} value={p.mounts?.externalFixed?.value ?? 0} onUpdate={(v) => p.update("system.mounts.externalFixed.value", v)} />
        <LabeledNumberInput key="internalFixed" label={localize(CONFIG.SR3E.MECHANICAL.internalFixed)} value={p.mounts?.internalFixed?.value ?? 0} onUpdate={(v) => p.update("system.mounts.internalFixed.value", v)} />
        <LabeledNumberInput key="pintles" label={localize(CONFIG.SR3E.MECHANICAL.pintles)} value={p.mounts?.pintles?.value ?? 0} onUpdate={(v) => p.update("system.mounts.pintles.value", v)} />
        <LabeledNumberInput key="miniTurrets" label={localize(CONFIG.SR3E.MECHANICAL.miniTurrets)} value={p.mounts?.miniTurrets?.value ?? 0} onUpdate={(v) => p.update("system.mounts.miniTurrets.value", v)} />
    </div>
</Foldout>
