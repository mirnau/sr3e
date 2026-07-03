<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledBoolean from "../items/LabeledBoolean.svelte";
import LabeledDropdown from "../items/LabeledDropdown.svelte";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";
import LabeledTextInput from "../items/LabeledTextInput.svelte";

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);
const system = actor.system as Record<string, any>;

let name = $state(actor.name as string);

const categoryOptions = $derived(kvOptions(CONFIG.SR3E.MECHANICAL_CATEGORIES));
const typeOptions = $derived(kvOptions(CONFIG.SR3E.VEHICLE_TYPES));
const powerOptions = $derived(kvOptions(CONFIG.SR3E.POWER_SOURCES));
const landingOptions = $derived(kvOptions(CONFIG.SR3E.LANDING_TAKEOFF));
const legalStatusOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_STATUSES));
const legalPermitOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_PERMITS));
const legalPriorityOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_PRIORITIES));
const isDrone = $derived(system.category === "drone");
const isGround = $derived(system.vehicleType === "ground");
const isAviation = $derived(system.vehicleType === "aviation");
const showLanding = $derived(["fixedWing", "rotor", "vectoredThrust", "lta", "tBird", "drone"].includes(system.category));
const commodity = $derived(system.commodity ?? {});
const legality = $derived(commodity.legality ?? {});

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function update(path: string, value: string | number | boolean) {
    actor.update({ [path]: value }, { render: false });
}
</script>

<ItemSheetWrapper csslayout="double">
    <ItemSheetComponent>
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
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.MECHANICAL.mechanical)}</h3>
        <div class="stat-grid single-column">
            <LabeledDropdown key="vehicleType" label={localize(CONFIG.SR3E.MECHANICAL.vehicleType)} value={system.vehicleType ?? "ground"} options={typeOptions} onUpdate={(v) => update("system.vehicleType", v)} />
            <LabeledDropdown key="category" label={localize(CONFIG.SR3E.MECHANICAL.category)} value={system.category} options={categoryOptions} onUpdate={(v) => update("system.category", v)} />
            <LabeledDropdown key="power" label={localize(CONFIG.SR3E.MECHANICAL.power)} value={system.power} options={powerOptions} onUpdate={(v) => update("system.power", v)} />
            {#if showLanding}
                <LabeledDropdown key="landingTakeoff" label={localize(CONFIG.SR3E.MECHANICAL.landingTakeoff)} value={system.landingTakeoff ?? ""} options={landingOptions} onUpdate={(v) => update("system.landingTakeoff", v)} />
            {/if}
            <LabeledTextInput key="seating" label={localize(CONFIG.SR3E.MECHANICAL.seating)} value={system.seating ?? ""} onUpdate={(v) => update("system.seating", v)} />
            <LabeledTextInput key="entryPoints" label={localize(CONFIG.SR3E.MECHANICAL.entryPoints)} value={system.entryPoints ?? ""} onUpdate={(v) => update("system.entryPoints", v)} />
            <LabeledBoolean key="riggerAdaptation" label={localize(CONFIG.SR3E.MECHANICAL.riggerAdaptation)} value={system.riggerAdaptation ?? false} onUpdate={(v) => update("system.riggerAdaptation", v)} />
            <LabeledBoolean key="remoteControlInterface" label={localize(CONFIG.SR3E.MECHANICAL.remoteControlInterface)} value={system.remoteControlInterface ?? false} onUpdate={(v) => update("system.remoteControlInterface", v)} />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.MECHANICAL.performance)}</h3>
        <div class="stat-grid two-column">
            {#if isGround}
                <LabeledNumberInput key="handlingRoad" label={localize(CONFIG.SR3E.MECHANICAL.handlingRoad)} value={system.handlingRoad ?? system.handling ?? 0} onUpdate={(v) => update("system.handlingRoad", v)} />
                <LabeledNumberInput key="handlingOffRoad" label={localize(CONFIG.SR3E.MECHANICAL.handlingOffRoad)} value={system.handlingOffRoad ?? system.handling ?? 0} onUpdate={(v) => update("system.handlingOffRoad", v)} />
            {:else}
                <LabeledNumberInput key="handling" label={localize(CONFIG.SR3E.MECHANICAL.handling)} value={system.handling ?? 0} onUpdate={(v) => update("system.handling", v)} />
            {/if}
            {#if isAviation}
                <LabeledNumberInput key="speedMax" label={localize(CONFIG.SR3E.MECHANICAL.speedMax)} value={system.speedMax ?? system.speed ?? 0} onUpdate={(v) => update("system.speedMax", v)} />
                <LabeledNumberInput key="speedStall" label={localize(CONFIG.SR3E.MECHANICAL.speedStall)} value={system.speedStall ?? 0} onUpdate={(v) => update("system.speedStall", v)} />
            {:else}
                <LabeledNumberInput key="speed" label={localize(CONFIG.SR3E.MECHANICAL.speed)} value={system.speed ?? 0} onUpdate={(v) => update("system.speed", v)} />
            {/if}
            <LabeledNumberInput key="accel" label={localize(CONFIG.SR3E.MECHANICAL.accel)} value={system.accel ?? 0} onUpdate={(v) => update("system.accel", v)} />
            <LabeledNumberInput key="body" label={localize(CONFIG.SR3E.MECHANICAL.body)} value={system.body ?? 0} onUpdate={(v) => update("system.body", v)} />
            <LabeledNumberInput key="armor" label={localize(CONFIG.SR3E.MECHANICAL.armor)} value={system.armor ?? 0} onUpdate={(v) => update("system.armor", v)} />
            <LabeledNumberInput key="signature" label={localize(CONFIG.SR3E.MECHANICAL.signature)} value={system.signature ?? 0} onUpdate={(v) => update("system.signature", v)} />
            <LabeledNumberInput key="sensor" label={localize(CONFIG.SR3E.MECHANICAL.sensor)} value={system.sensor ?? 0} onUpdate={(v) => update("system.sensor", v)} />
            <LabeledNumberInput key={isDrone ? "pilot" : "autonav"} label={localize(isDrone ? CONFIG.SR3E.MECHANICAL.pilot : CONFIG.SR3E.MECHANICAL.autonav)} value={isDrone ? (system.pilot ?? 0) : (system.autonav ?? 0)} onUpdate={(v) => update(isDrone ? "system.pilot" : "system.autonav", v)} />
            <LabeledNumberInput key="speedTurbo" label={localize(CONFIG.SR3E.MECHANICAL.speedTurbo)} value={system.speedTurbo ?? 0} onUpdate={(v) => update("system.speedTurbo", v)} />
            <LabeledNumberInput key="accelTurbo" label={localize(CONFIG.SR3E.MECHANICAL.accelTurbo)} value={system.accelTurbo ?? 0} onUpdate={(v) => update("system.accelTurbo", v)} />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.MECHANICAL.electronicWarfare)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput key="ecm" label={localize(CONFIG.SR3E.MECHANICAL.ecm)} value={system.ecm ?? 0} onUpdate={(v) => update("system.ecm", v)} />
            <LabeledNumberInput key="eccm" label={localize(CONFIG.SR3E.MECHANICAL.eccm)} value={system.eccm ?? 0} onUpdate={(v) => update("system.eccm", v)} />
            <LabeledNumberInput key="flux" label={localize(CONFIG.SR3E.MECHANICAL.flux)} value={system.flux ?? 0} onUpdate={(v) => update("system.flux", v)} />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.MECHANICAL.capacity)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput key="cargo" label={localize(CONFIG.SR3E.MECHANICAL.cargo)} value={system.cargo ?? 0} onUpdate={(v) => update("system.cargo", v)} />
            <LabeledNumberInput key="load" label={localize(CONFIG.SR3E.MECHANICAL.load)} value={system.load ?? 0} onUpdate={(v) => update("system.load", v)} />
            {#if isDrone}
                <LabeledNumberInput key="setupBreakdownMinutes" label={localize(CONFIG.SR3E.MECHANICAL.setupBreakdownMinutes)} value={system.setupBreakdownMinutes ?? 0} onUpdate={(v) => update("system.setupBreakdownMinutes", v)} />
            {/if}
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent spanTwo>
        <h3>{localize(CONFIG.SR3E.MECHANICAL.mountsTitle)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput key="firmpoints" label={localize(CONFIG.SR3E.MECHANICAL.firmpoints)} value={system.mounts?.firmpoints ?? 0} onUpdate={(v) => update("system.mounts.firmpoints", v)} />
            <LabeledNumberInput key="hardpoints" label={localize(CONFIG.SR3E.MECHANICAL.hardpoints)} value={system.mounts?.hardpoints ?? 0} onUpdate={(v) => update("system.mounts.hardpoints", v)} />
            <LabeledNumberInput key="turrets" label={localize(CONFIG.SR3E.MECHANICAL.turrets)} value={system.mounts?.turrets ?? 0} onUpdate={(v) => update("system.mounts.turrets", v)} />
            <LabeledNumberInput key="externalFixed" label={localize(CONFIG.SR3E.MECHANICAL.externalFixed)} value={system.mounts?.externalFixed ?? 0} onUpdate={(v) => update("system.mounts.externalFixed", v)} />
            <LabeledNumberInput key="internalFixed" label={localize(CONFIG.SR3E.MECHANICAL.internalFixed)} value={system.mounts?.internalFixed ?? 0} onUpdate={(v) => update("system.mounts.internalFixed", v)} />
            <LabeledNumberInput key="pintles" label={localize(CONFIG.SR3E.MECHANICAL.pintles)} value={system.mounts?.pintles ?? 0} onUpdate={(v) => update("system.mounts.pintles", v)} />
            <LabeledNumberInput key="miniTurrets" label={localize(CONFIG.SR3E.MECHANICAL.miniTurrets)} value={system.mounts?.miniTurrets ?? 0} onUpdate={(v) => update("system.mounts.miniTurrets", v)} />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent spanTwo>
        <h3>{localize(CONFIG.SR3E.COMMODITY.commodity)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput key="days" label={localize(CONFIG.SR3E.COMMODITY.days)} value={commodity.days ?? 0} onUpdate={(v) => update("system.commodity.days", v)} />
            <LabeledNumberInput key="cost" label={localize(CONFIG.SR3E.COMMODITY.cost)} value={commodity.cost ?? 0} onUpdate={(v) => update("system.commodity.cost", v)} />
            <LabeledNumberInput key="streetIndex" label={localize(CONFIG.SR3E.COMMODITY.streetIndex)} value={commodity.streetIndex ?? 1} onUpdate={(v) => update("system.commodity.streetIndex", v)} />
            <LabeledBoolean key="isBroken" label={localize(CONFIG.SR3E.COMMODITY.isBroken)} value={commodity.isBroken ?? false} onUpdate={(v) => update("system.commodity.isBroken", v)} />
        </div>
        <div class="stat-grid single-column">
            <LabeledDropdown key="status" label={localize(CONFIG.SR3E.COMMODITY.legalstatus)} value={legality.status ?? ""} options={legalStatusOptions} onUpdate={(v) => update("system.commodity.legality.status", v)} />
            <LabeledDropdown key="permit" label={localize(CONFIG.SR3E.COMMODITY.legalpermit)} value={legality.permit ?? ""} options={legalPermitOptions} onUpdate={(v) => update("system.commodity.legality.permit", v)} />
            <LabeledDropdown key="priority" label={localize(CONFIG.SR3E.COMMODITY.legalenforcementpriority)} value={legality.priority ?? ""} options={legalPriorityOptions} onUpdate={(v) => update("system.commodity.legality.priority", v)} />
        </div>
    </ItemSheetComponent>
</ItemSheetWrapper>
