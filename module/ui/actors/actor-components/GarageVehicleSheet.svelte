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
import { INVENTORY_PRIMARY_FLAG, INVENTORY_SECONDARY_FLAG } from "./inventory/inventoryMode";
import { buildSkillSetup } from "../../../services/combat/procedures/simpleSetups";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";

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
let selectedSkillId = $state<string>("");

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const ownedVcrItems = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "vehiclecontrolrig")
);
const activeSkillOptions = $derived(activeSkills.map((skill: any) => ({ value: skill.id, label: skill.name })));
const vcrOptions = $derived(ownedVcrItems.map((vcr: any) => ({ value: vcr.id, label: vcr.name })));
const mountedWeapons = $derived(
    [...(vehicle?.items ?? [])].filter(
        (item: any) => item.type === "weapon" &&
            (item.flags?.sr3e?.[INVENTORY_PRIMARY_FLAG.vehicle] || item.flags?.sr3e?.[INVENTORY_SECONDARY_FLAG.vehicle])
    )
);
const vehicleType = $derived(vehicle?.system?.vehicleType ?? "ground");
const handlingTN = $derived(
    vehicleType === "ground"
        ? (vehicle?.system?.handlingRoad?.value ?? vehicle?.system?.handling?.value ?? 4)
        : (vehicle?.system?.handling?.value ?? 4)
);

onMount(async () => {
    vehicle = await fromUuid(vehicleUuid) as any;
    if (activeSkills.length > 0) selectedSkillId = activeSkills[0].id;
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

function onDrivingRoll() {
    if (!vehicle || !selectedSkillId) return;
    const vcr = p.entry.jackedIn ? selectedVcr() : null;
    const tn = vcr ? Math.max(2, handlingTN - Number(vcr.system?.level ?? 0)) : handlingTN;
    const setup = buildSkillSetup(characterActor as any, selectedSkillId, null, vehicle.name, tn);
    if (vcr) {
        const skillItem = (characterActor as any).items?.get(selectedSkillId);
        const skillRating = Number(skillItem?.system?.activeSkill?.value ?? 0);
        setup.poolAvailableOverrides = { control: skillRating };
    }
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
                    <span>{localize(CONFIG.SR3E.MECHANICAL.speed)}: {vehicle.system.speed?.value ?? 0}</span>
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

            {#if ownedVcrItems.length > 0}
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
            {/if}

            {#if activeSkills.length > 0 || mountedWeapons.length > 0}
                <SheetCard itemClass="garage-packery-grid-item">
                    <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.INVENTORY.garageactions)}</h4>
                    {#if activeSkills.length > 0}
                        <div class="garage-vehicle-roll">
                            <LabeledDropdown
                                key="drivingSkill"
                                label={localize(CONFIG.SR3E.SKILL.skill)}
                                value={selectedSkillId}
                                options={activeSkillOptions}
                                onUpdate={(v) => (selectedSkillId = v)}
                            />
                            <button type="button" onclick={onDrivingRoll}>{localize(CONFIG.SR3E.INVENTORY.garagedrivingroll)}</button>
                        </div>
                    {/if}
                    {#if mountedWeapons.length > 0}
                        <div class="garage-vehicle-weapons">
                            {#each mountedWeapons as weapon (weapon.id)}
                                <GarageWeaponCard
                                    {characterActor}
                                    {weapon}
                                    jackedIn={p.entry.jackedIn}
                                    vcrLevel={Number(selectedVcr()?.system?.level ?? 0)}
                                />
                            {/each}
                        </div>
                    {/if}
                </SheetCard>
            {/if}
        </PackeryGrid>
    </div>
{/if}
