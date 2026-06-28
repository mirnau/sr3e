<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { StoreManager } from "../../../../utilities/StoreManager.svelte";
import { localize } from "../../../../services/utilities";
import { reloadWeapon } from "../../../../services/combat/procedures/ammoService";
import FilterToggle from "./FilterToggle.svelte";
import WeaponComponent from "./components/WeaponComponent.svelte";
import AmmunitionComponent from "./components/AmmunitionComponent.svelte";
import WearableComponent from "./components/WearableComponent.svelte";

const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto"]);

const p = $props<{ actor: Actor; item: Item }>();
const actor = untrack(() => p.actor);
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
const storeManager = StoreManager.Instance;

storeManager.Subscribe(item);
onDestroy(() => storeManager.Unsubscribe(item));

const isFavoriteStore = storeManager.GetFlagStore<boolean>(item, "isFavorite", false);
const isEquippedStore = storeManager.GetFlagStore<boolean>(item, "isEquipped", false);
const linkedSkillIdStore = storeManager.GetRWStore<string>(item, "linkedSkillId");

const isFirearm = $derived(item.type === "weapon" && FIREARM_MODES.has(sys.mode ?? ""));

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
    await reloadWeapon(actor as any, item as any);
}

async function onTrashClick() {
    const confirmed = await (foundry.applications.api.DialogV2 as any).confirm({
        window: { title: localize("sr3e.modal.deleteskilltitle") },
        content: `<p><strong>${item.name}</strong></p>`,
        yes: { icon: "fa-solid fa-trash-can" },
        defaultYes: false,
    });
    if (!confirmed) return;
    await (actor as any).deleteEmbeddedDocuments("Item", [(item as any).id]);
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
        <img src={(item as any).img} role="presentation" alt={item.name ?? ""} />
    </div>

    <div class="asset-card-column">
        <div class="asset-card-row">
            <div class="asset-card-column">
                <h3 class="no-margin uppercase">{item.name}</h3>

                {#if linkedSkillName}
                    <h3 class="no-margin uppercase">
                        {localize(CONFIG.SR3E.SKILL.skill)}: {linkedSkillName}
                    </h3>
                {/if}

                {#if item.type === "weapon"}
                    <WeaponComponent {item} />
                {:else if item.type === "ammunition"}
                    <AmmunitionComponent {item} />
                {:else if item.type === "wearable"}
                    <WearableComponent {item} />
                {/if}
            </div>
        </div>

        <div class="asset-card-row">
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-dice"
                aria-label="Roll"
                disabled
            ></button>

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

    <div class="asset-toggles">
        <FilterToggle bind:checked={$isFavoriteStore} svgName="star-svgrepo-com.svg" />
        <FilterToggle bind:checked={$isEquippedStore} svgName="backpack-svgrepo-com.svg" />
    </div>
</div>
