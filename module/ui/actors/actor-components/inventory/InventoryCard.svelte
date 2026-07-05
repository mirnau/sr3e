<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { StoreManager } from "../../../../utilities/StoreManager.svelte";
import { localize } from "../../../../services/utilities";
import { reloadWeapon } from "../../../../services/combat/procedures/ammoService";
import { buildWeaponAttack } from "../../../../services/combat/procedures/weaponAttack";
import { buildSpellcastingSetup, canStartSpellcasting } from "../../../../services/combat/procedures/spellcastingSetup";
import { buildAttributeSetup } from "../../../../services/combat/procedures/simpleSetups";
import { openComposer } from "../../../../services/combat/procedures/composerService.svelte";
import FilterToggle from "./FilterToggle.svelte";
import { inventoryModeFor, INVENTORY_PRIMARY_FLAG, INVENTORY_SECONDARY_FLAG } from "./inventoryMode";
import WeaponComponent from "./components/WeaponComponent.svelte";
import AmmunitionComponent from "./components/AmmunitionComponent.svelte";
import WearableComponent from "./components/WearableComponent.svelte";
import MedicalComponent from "./components/MedicalComponent.svelte";
import SpellComponent from "./components/SpellComponent.svelte";
import FocusComponent from "./components/FocusComponent.svelte";
import GadgetComponent from "./components/GadgetComponent.svelte";
import AdeptPowerComponent from "./components/AdeptPowerComponent.svelte";
import AugmentationComponent from "./components/AugmentationComponent.svelte";

const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto", "energy"]);
const MELEE_MODES = new Set(["blade", "blunt"]);

const p = $props<{
    actor: Actor;
    item: Item;
    hardpointFull?: boolean;
    firmpointFull?: boolean;
    hideToggles?: boolean;
    hideRollButton?: boolean;
    // A vehicle-mounted weapon can reload from either the vehicle's own
    // ammo stock or this extra actor's (the seated character's) carried
    // ammo — both get searched for compatible ammunition.
    extraAmmoSourceActor?: Actor;
}>();
const actor = untrack(() => p.actor);
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
const storeManager = StoreManager.Instance;

storeManager.Subscribe(item);
onDestroy(() => {
    storeManager.Unsubscribe(item);
    if (typeof Hooks !== "undefined") {
        Hooks.off("targetToken", targetHookId);
    }
});

const mode = inventoryModeFor(actor);
const isVehicle = mode === "vehicle";
const primaryFlag = INVENTORY_PRIMARY_FLAG[mode];
const secondaryFlag = INVENTORY_SECONDARY_FLAG[mode];
const isPrimaryStore = storeManager.GetFlagStore<boolean>(item, primaryFlag, false);
const isSecondaryStore = storeManager.GetFlagStore<boolean>(item, secondaryFlag, false);

const primaryDisabled = $derived(isVehicle && !$isPrimaryStore && Boolean(p.hardpointFull));
const secondaryDisabled = $derived(isVehicle && !$isSecondaryStore && Boolean(p.firmpointFull));

function togglePrimary(checked: boolean) {
    isPrimaryStore.set(checked);
    if (checked && isVehicle) isSecondaryStore.set(false);
}

function toggleSecondary(checked: boolean) {
    isSecondaryStore.set(checked);
    if (checked && isVehicle) isPrimaryStore.set(false);
}
const linkedSkillIdStore = storeManager.GetRWStore<string>(item, "linkedSkillId");
const nameStore = storeManager.GetRWStore<string>(item, "name", true);

const isFirearm = $derived(item.type === "weapon" && FIREARM_MODES.has(sys.mode ?? ""));
const isSpell = $derived(item.type === "spell");
const canCastSpell = $derived(item.type === "spell" && canStartSpellcasting(item as never));
const isPassiveAdeptPower = $derived(item.type === "adeptpower" && !sys.isActive);
const isActiveAdeptPower = $derived(item.type === "adeptpower" && Boolean(sys.isActive));

let targetCount = $state(typeof game !== "undefined" ? ((game.user as any)?.targets?.size ?? 0) : 0);
let hasAmmo = $state(true);

const isRollEnabled = $derived(
    (item.type === "weapon" && targetCount === 1 && !!$linkedSkillIdStore && hasAmmo) ||
    canCastSpell ||
    isActiveAdeptPower
);
const rollDisabledReason = $derived(
    item.type === "weapon" && !$linkedSkillIdStore ? "No skill selected" :
    item.type === "weapon" && !hasAmmo ? "No ammo loaded" :
    item.type === "weapon" && targetCount !== 1 ? "Select exactly one target" :
    item.type === "spell" && !canCastSpell ? "Ready fetish required" :
    ""
);

const targetHookId = (typeof Hooks !== "undefined")
    ? Hooks.on("targetToken", () => { targetCount = typeof game !== "undefined" ? ((game.user as any)?.targets?.size ?? 0) : 0; })
    : -1;

const linkedSkillName = $derived.by(() => {
    const raw = $linkedSkillIdStore ?? "";
    if (!raw) return "";
    const [skillId, specIndexRaw] = raw.split("::");
    const skill = (actor as any).items?.get(skillId);
    if (!skill) return "";
    const skillSys = skill.system as Record<string, any>;
    const skillType: string = skillSys.skillType ?? "";
    const skillData = skillSys[`${skillType}Skill`] as Record<string, any> | undefined;
    const specs: { name: string }[] = skillData?.specializations ?? [];
    const specIndex = Number.parseInt(specIndexRaw);
    const spec = Number.isFinite(specIndex) ? specs[specIndex] : null;
    return spec ? `${skill.name} — ${spec.name}` : (skill.name ?? "");
});

function onDragStart(event: DragEvent) {
    const payload = { type: (item as any).documentName ?? "Item", uuid: (item as any).uuid };
    event.dataTransfer?.setData("text/plain", JSON.stringify(payload));
}

async function onReloadClick() {
    const sources = p.extraAmmoSourceActor ? [actor, p.extraAmmoSourceActor] : actor;
    await reloadWeapon(sources as any, item as any);
}

async function onTrashClick() {
    const confirmed = await (foundry.applications.api.DialogV2 as any).confirm({
        window: { title: localize("sr3e.modal.deleteskilltitle") },
        content: `<p><strong>${$nameStore}</strong></p>`,
        yes: { icon: "fa-solid fa-trash-can" },
        defaultYes: false,
    });
    if (!confirmed) return;
    await (actor as any).deleteEmbeddedDocuments("Item", [(item as any).id]);
}

function onRollClick() {
    if (!isRollEnabled) return;
    if (isSpell) {
        openComposer(buildSpellcastingSetup(actor as never, item as never), actor);
        return;
    }
    if (isActiveAdeptPower) {
        openComposer(buildAttributeSetup(actor as never, "magic", $nameStore), actor);
        return;
    }
    const setup = buildWeaponAttack(actor as never, item as never);
    openComposer(setup, actor);
}

function onDrainClick() {
    openComposer(buildAttributeSetup(actor as never, "willpower", `${$nameStore} — ${localize(CONFIG.SR3E.SPELL.drain)}`), actor);
}
</script>

<!-- svelte-ignore a11y_unknown_aria_attribute -->
<div
    data-item-id={(item as any).id}
    class="asset-card"
    role="presentation"
    aria-role="presentation"
    draggable="true"
    ondragstart={onDragStart}
>
    <div class="asset-background-layer"></div>
    <div class="image-mask">
        <img src={(item as any).img} role="presentation" alt={$nameStore ?? ""} />
    </div>

    <div class="asset-card-column">
        <div class="asset-card-row">
            <div class="asset-card-column">
                <h3 class="no-margin uppercase">{$nameStore}</h3>

                {#if linkedSkillName}
                    <h3 class="no-margin uppercase">
                        {localize(CONFIG.SR3E.SKILL.skill)}: {linkedSkillName}
                    </h3>
                {/if}

                {#if item.type === "weapon"}
                    <WeaponComponent {item} bind:hasAmmo />
                {:else if item.type === "ammunition"}
                    <AmmunitionComponent {item} />
                {:else if item.type === "wearable"}
                    <WearableComponent {item} />
                {:else if item.type === "medical"}
                    <MedicalComponent {item} />
                {:else if item.type === "spell"}
                    <SpellComponent {item} />
                {:else if item.type === "focus"}
                    <FocusComponent {item} />
                {:else if item.type === "gadget"}
                    <GadgetComponent {item} />
                {:else if item.type === "adeptpower"}
                    <AdeptPowerComponent {item} />
                {:else if item.type === "augmentation"}
                    <AugmentationComponent {item} />
                {/if}
            </div>
        </div>

        <div class="asset-card-row">
            {#if !p.hideRollButton && !isPassiveAdeptPower}
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-dice"
                    aria-label="Roll"
                    title={rollDisabledReason}
                    disabled={!isRollEnabled}
                    onclick={onRollClick}
                ></button>
            {/if}

            {#if isActiveAdeptPower && Boolean(sys.hasDrain)}
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-tornado"
                    aria-label={localize(CONFIG.SR3E.SPELL.drain)}
                    title={localize(CONFIG.SR3E.SPELL.drain)}
                    onclick={onDrainClick}
                ></button>
            {/if}

            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-pencil"
                aria-label="Edit"
                onclick={() => (item as any).sheet?.render(true)}
            ></button>

            {#if isFirearm}
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-repeat"
                    aria-label="Reload"
                    onclick={onReloadClick}
                ></button>
            {/if}

            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-trash-can"
                aria-label="Trash"
                onclick={onTrashClick}
            ></button>
        </div>
    </div>

    {#if !p.hideToggles}
        <div class="asset-toggles">
            {#if isVehicle}
                <FilterToggle
                    checked={$isPrimaryStore}
                    onChange={(e) => togglePrimary(e.target.checked)}
                    letter="H"
                    label={localize(CONFIG.SR3E.MECHANICAL.hardpoint)}
                    disabled={primaryDisabled}
                />
                <FilterToggle
                    checked={$isSecondaryStore}
                    onChange={(e) => toggleSecondary(e.target.checked)}
                    letter="F"
                    label={localize(CONFIG.SR3E.MECHANICAL.firmpoint)}
                    disabled={secondaryDisabled}
                />
            {:else}
                <FilterToggle bind:checked={$isPrimaryStore} svgName="star-svgrepo-com.svg" />
                {#if item.type !== "spell" && item.type !== "adeptpower"}
                    <FilterToggle bind:checked={$isSecondaryStore} svgName="backpack-svgrepo-com.svg" />
                {/if}
            {/if}
        </div>
    {/if}
</div>
