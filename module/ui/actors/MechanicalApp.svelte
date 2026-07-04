<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import PackeryGrid from "../common-components/PackeryGrid.svelte";
import SheetCard from "../common-components/SheetCard.svelte";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";
import VehicleConditionMonitor from "./actor-components/VehicleConditionMonitor.svelte";
import MechanicalIdentity from "./mechanical/MechanicalIdentity.svelte";
import MechanicalPerformance from "./mechanical/MechanicalPerformance.svelte";
import MechanicalCapacity from "./mechanical/MechanicalCapacity.svelte";
import MechanicalMounts from "./mechanical/MechanicalMounts.svelte";
import MechanicalCommodity from "./mechanical/MechanicalCommodity.svelte";
import Foldout from "./actor-components/Foldout.svelte";
import MechanicalRegister from "./mechanical/MechanicalRegister.svelte";

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);
const system = actor.system as Record<string, any>;

let name = $state(actor.name as string);

function update(path: string, value: string | number | boolean) {
    actor.update({ [path]: value }, { render: false });
}
</script>

<PackeryGrid>
    <SheetCard>
        <Image entity={actor} />
        <div class="large-input-wrapper">
            <div class="large-input-background"></div>
            <input
                class="large"
                name="name"
                type="text"
                value={name}
                onchange={(e) => actor.update({ name: (e.target as HTMLInputElement).value })}
            />
        </div>
    </SheetCard>

    <SheetCard>
        <MechanicalIdentity {system} {update} />
    </SheetCard>

    <SheetCard>
        <MechanicalPerformance {system} {update} />
    </SheetCard>

    <SheetCard>
        <VehicleConditionMonitor
            boxesFilled={system.condition?.value ?? 0}
            onUpdate={(v) => update("system.condition.value", v)}
        />
    </SheetCard>

    <SheetCard>
        <Foldout label={localize(CONFIG.SR3E.MECHANICAL.electronicWarfare)}>
            <div class="stat-grid two-column">
                <LabeledNumberInput key="ecm" label={localize(CONFIG.SR3E.MECHANICAL.ecm)} value={system.ecm?.value ?? 0} onUpdate={(v) => update("system.ecm.value", v)} />
                <LabeledNumberInput key="eccm" label={localize(CONFIG.SR3E.MECHANICAL.eccm)} value={system.eccm?.value ?? 0} onUpdate={(v) => update("system.eccm.value", v)} />
                <LabeledNumberInput key="flux" label={localize(CONFIG.SR3E.MECHANICAL.flux)} value={system.flux?.value ?? 0} onUpdate={(v) => update("system.flux.value", v)} />
            </div>
        </Foldout>
    </SheetCard>

    <SheetCard>
        <MechanicalCapacity {system} {update} />
    </SheetCard>

    <SheetCard>
        <MechanicalMounts mounts={system.mounts} {update} />
    </SheetCard>

    <SheetCard>
        <MechanicalCommodity commodity={system.commodity} {update} />
    </SheetCard>

    <SheetCard span="dynamic">
        <MechanicalRegister {actor} />
    </SheetCard>
</PackeryGrid>
