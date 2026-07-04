<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import PackeryGrid from "../../common-components/PackeryGrid.svelte";
import SheetCard from "../../common-components/SheetCard.svelte";
import VehicleConditionMonitor from "./VehicleConditionMonitor.svelte";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import GarageWeaponCard from "./GarageWeaponCard.svelte";
import GarageRiggerActionsCard from "./GarageRiggerActionsCard.svelte";
import { INVENTORY_PRIMARY_FLAG, INVENTORY_SECONDARY_FLAG } from "./inventory/inventoryMode";
import { buildVehicleDrivingTestSetup } from "../../../services/combat/procedures/vehicleDrivingTest";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";
import { syncRiggerBonusEffect } from "../../../services/effects/riggerBonusEffect";

type GarageEntry = { uuid: string; seated: boolean; vcrId: string; jackedIn: boolean };

const p = $props<{
    actor: Actor;
    entry: GarageEntry;
    onUpdate: (changes: Partial<GarageEntry>) => void;
    onUnseat: () => void;
}>();
const characterActor = untrack(() => p.actor);
const vehicleUuid = untrack(() => p.entry.uuid);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

storeManager.Subscribe(characterActor);
onDestroy(() => storeManager.Unsubscribe(characterActor));

let vehicle = $state<any>(null);
// Flag-backed (not local $state) so the choice survives closing/reopening
// the sheet and unseating/reseating, not just component remounts.
const selectedSkillIdStore = storeManager.GetFlagStore<string>(characterActor, "garageDrivingSkillId", "");
// Foundry document mutations (e.g. flagging a weapon isHardpoint on the
// vehicle's own sheet) aren't observed by Svelte's reactivity on their
// own — vehicle.items is a live Foundry collection, not a $state-tracked
// one. Bumping this on createItem/updateItem/deleteItem forces
// mountedWeapons to recompute instead of staying frozen at whatever the
// vehicle's items looked like the moment this sheet mounted.
let vehicleItemsVersion = $state(0);

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const ownedVcrItems = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "vehiclecontrolrig")
);
const activeSkillOptions = $derived(activeSkills.map((skill: any) => ({ value: skill.id, label: skill.name })));
const vcrOptions = $derived(ownedVcrItems.map((vcr: any) => ({ value: vcr.id, label: vcr.name })));
const mountedWeapons = $derived.by(() => {
    void vehicleItemsVersion;
    return [...(vehicle?.items ?? [])].filter(
        (item: any) => item.type === "weapon" &&
            (item.flags?.sr3e?.[INVENTORY_PRIMARY_FLAG.vehicle] || item.flags?.sr3e?.[INVENTORY_SECONDARY_FLAG.vehicle])
    );
});
// Jacking in requires the vehicle itself to be rigger-adapted, not just
// the character owning a VCR — set on the vehicle's own sheet
// (MechanicalIdentity.svelte), previously never checked here.
const isRiggerAdapted = $derived(!!vehicle?.system?.riggerAdaptation);
const vehicleType = $derived(vehicle?.system?.vehicleType ?? "ground");
// A Handling stat of exactly 0 means "unset on this vehicle" (SimpleStat's
// schema default), not a real TN of 0 — || (not ??) falls back to the
// neutral default TN of 4 in that case, same as an unconfigured Handling.
const handlingTN = $derived(
    vehicleType === "ground"
        ? (vehicle?.system?.handlingRoad?.value || vehicle?.system?.handling?.value || 4)
        : (vehicle?.system?.handling?.value || 4)
);

function onVehicleItemChange(item: any) {
    if (item.parent?.id !== vehicle?.id) return;
    vehicleItemsVersion += 1;
}

const createHookId = Hooks.on("createItem", onVehicleItemChange);
const updateHookId = Hooks.on("updateItem", onVehicleItemChange);
const deleteHookId = Hooks.on("deleteItem", onVehicleItemChange);

onDestroy(() => {
    Hooks.off("createItem", createHookId);
    Hooks.off("updateItem", updateHookId);
    Hooks.off("deleteItem", deleteHookId);
});

onMount(async () => {
    vehicle = await fromUuid(vehicleUuid) as any;
    if (!$selectedSkillIdStore && activeSkills.length > 0) selectedSkillIdStore.set(activeSkills[0].id);
    if (!p.entry.vcrId && ownedVcrItems.length > 0) {
        const highestLevel = [...ownedVcrItems].sort((a, b) => (b.system?.level ?? 0) - (a.system?.level ?? 0))[0];
        p.onUpdate({ vcrId: highestLevel.id });
    }
});

function openSheet() {
    (vehicle as any)?.sheet?.render(true);
}

function updateVehicle(path: string, value: number) {
    vehicle?.update({ [path]: value });
}

function onVcrChange(vcrId: string) {
    p.onUpdate({ vcrId });
}

function onJackedInChange(jackedIn: boolean) {
    p.onUpdate({ jackedIn });
}

function selectedVcr() {
    return ownedVcrItems.find((vcr: any) => vcr.id === p.entry.vcrId) ?? null;
}

$effect(() => {
    const jackedIn = p.entry.jackedIn;
    const vcrLevel = jackedIn ? Number(selectedVcr()?.system?.level ?? 0) : 0;
    void syncRiggerBonusEffect(characterActor as never, jackedIn, vcrLevel);
});

// Defensive: if the vehicle's Rigger Adaptation gets switched off (or this
// entry predates the gate below existing) while jacked in, force jack-out
// rather than leaving a rigger benefiting from a vehicle that can't
// actually support it — warn so the player knows why, not just silently.
$effect(() => {
    if (vehicle && p.entry.jackedIn && !isRiggerAdapted) {
        p.onUpdate({ jackedIn: false });
        ui.notifications?.warn(localize(CONFIG.SR3E.INVENTORY.garagenoriggeradaptation));
    }
});

function onDrivingRoll() {
    if (!vehicle || !$selectedSkillIdStore) return;
    const vcr = p.entry.jackedIn ? selectedVcr() : null;
    const setup = buildVehicleDrivingTestSetup(characterActor as never, $selectedSkillIdStore, handlingTN, vcr as never, vehicle.name);
    const hasTargets = (game.user?.targets?.size ?? 0) > 0;
    if (hasTargets) {
        openComposer(setup, characterActor as never);
    } else {
        void executeProcedure(setup, characterActor as never);
    }
}
</script>

{#if vehicle}
    <div class="garage-vehicle-sheet">
        <PackeryGrid gridPrefix="garage" itemSelector="garage-packery-grid-item">
            <SheetCard itemClass="garage-packery-grid-item">
                <div class="garage-vehicle-header">
                    <button type="button" class="garage-vehicle-name" onclick={openSheet}>{vehicle.name}</button>
                    <LabeledBoolean
                        key="seated"
                        label={localize(CONFIG.SR3E.INVENTORY.garageseated)}
                        value={true}
                        onUpdate={(v) => !v && p.onUnseat()}
                    />
                </div>
                <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.MECHANICAL.performance)}</h4>
                <div class="stat-grid two-column">
                    <span>{localize(CONFIG.SR3E.MECHANICAL.handling)}: {handlingTN}</span>
                    <span>{localize(CONFIG.SR3E.MECHANICAL.currentSpeed)}: {vehicle.system.currentSpeed?.value ?? 0}</span>
                    <span>{localize(CONFIG.SR3E.MECHANICAL.body)}: {vehicle.system.body?.value ?? 0}</span>
                    <span>{localize(CONFIG.SR3E.MECHANICAL.armor)}: {vehicle.system.armor?.value ?? 0}</span>
                </div>
            </SheetCard>

            <SheetCard itemClass="garage-packery-grid-item">
                <VehicleConditionMonitor
                    boxesFilled={vehicle.system.condition?.value ?? 0}
                    onUpdate={(v) => updateVehicle("system.condition.value", v)}
                />
            </SheetCard>

            {#if ownedVcrItems.length > 0 && isRiggerAdapted}
                <SheetCard itemClass="garage-packery-grid-item">
                    <LabeledDropdown
                        key="vcrId"
                        label={localize(CONFIG.SR3E.ITEM_TYPES.vehiclecontrolrig)}
                        value={p.entry.vcrId}
                        options={vcrOptions}
                        onUpdate={onVcrChange}
                    />
                    <LabeledBoolean
                        key="jackedIn"
                        label={localize(CONFIG.SR3E.INVENTORY.garagejackedin)}
                        value={p.entry.jackedIn}
                        onUpdate={onJackedInChange}
                    />
                </SheetCard>
            {:else if ownedVcrItems.length > 0 && !isRiggerAdapted}
                <SheetCard itemClass="garage-packery-grid-item">
                    <p class="no-margin">{localize(CONFIG.SR3E.INVENTORY.garagenoriggeradaptation)}</p>
                </SheetCard>
            {/if}

            {#if activeSkills.length > 0 && !p.entry.jackedIn}
                <SheetCard itemClass="garage-packery-grid-item">
                    <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.INVENTORY.garageactions)}</h4>
                    <div class="garage-vehicle-roll">
                        <LabeledDropdown
                            key="drivingSkill"
                            label={localize(CONFIG.SR3E.SKILL.skill)}
                            value={$selectedSkillIdStore}
                            options={activeSkillOptions}
                            onUpdate={(v) => selectedSkillIdStore.set(v)}
                        />
                        <button type="button" onclick={onDrivingRoll}>{localize(CONFIG.SR3E.INVENTORY.garagedrivingroll)}</button>
                    </div>
                </SheetCard>
            {/if}

            {#each mountedWeapons as weapon (weapon.id)}
                <SheetCard itemClass="garage-packery-grid-item">
                    <GarageWeaponCard
                        {characterActor}
                        {weapon}
                        jackedIn={p.entry.jackedIn}
                        vcrLevel={Number(selectedVcr()?.system?.level ?? 0)}
                    />
                </SheetCard>
            {/each}

            {#if p.entry.jackedIn}
                <SheetCard itemClass="garage-packery-grid-item">
                    <GarageRiggerActionsCard
                        {characterActor}
                        {vehicle}
                        vcr={selectedVcr()}
                        {handlingTN}
                    />
                </SheetCard>
            {/if}
        </PackeryGrid>
    </div>
{/if}
