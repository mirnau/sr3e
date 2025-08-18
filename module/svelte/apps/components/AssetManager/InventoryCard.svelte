<script>
   import { onMount, onDestroy } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import { localize } from "@services/utilities.js";
   import FirearmService from "@families/FirearmService.js";
   import WeaponComponent from "@sveltecomponent/AssetManager/components/WeaponComponent.svelte";
   import AmmunitionComponent from "@sveltecomponent/AssetManager/components/AmmunitionComponent.svelte";
   import WearableComponent from "@sveltecomponent/AssetManager/components/WearableComponent.svelte";
   import { ProcedureFactory } from "@services/procedure/FSM/ProcedureFactory.js";

   let { item, config } = $props();

   const mainItemsStoreManager = StoreManager.Subscribe(item);

   // Flags
   let isFavorite = $state(false);
   let isEquipped = $state(false);
   const isFavoriteStore = mainItemsStoreManager.GetFlagStore("isFavorite");
   const isEquippedStore = mainItemsStoreManager.GetFlagStore("isEquipped");

   // Linked skill
   const linkedSkillIdStore = mainItemsStoreManager.GetRWStore("linkedSkillId");
   const hasLinkedSkill = $derived(!!$linkedSkillIdStore && $linkedSkillIdStore !== "");
   let linkedSkillName = $state("");

   let hasAmmo = $state(true);

   let isFirearm = $derived(
      item?.type === "weapon" &&
         (String(item?.system?.mode ?? "") === "manual" ||
            String(item?.system?.mode ?? "") === "semiauto" ||
            String(item?.system?.mode ?? "") === "burst" ||
            String(item?.system?.mode ?? "") === "fullauto")
   );

   // Determine active ammo source - simplified without mirrors
   $effect(() => {
      if (!hasLinkedSkill) {
         linkedSkillName = "";
         return;
      }

      const [skillId, specIndexRaw] = ($linkedSkillIdStore ?? "").split("::");
      const skill = item.parent?.items?.get(skillId);
      if (!skill) {
         linkedSkillName = "";
         return;
      }

      const skillType = skill.system.skillType;
      const skillData = skill.system[`${skillType}Skill`];
      const specs = skillData.specializations ?? [];

      const specIndex = Number.parseInt(specIndexRaw);
      const spec = Number.isFinite(specIndex) ? specs[specIndex] : null;

      linkedSkillName = spec ? `${skill.name} - ${spec.name}` : (skill.name ?? "");
   });

   // Sync flags
   onMount(() => {
      isFavorite = $isFavoriteStore;
      isEquipped = $isEquippedStore;
   });

   $effect(() => {
      $isFavoriteStore = isFavorite;
      $isEquippedStore = isEquipped;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(item);
   });

   async function onReloadClick() {
      await FirearmService.reloadWeapon(item.parent, item);
   }

   function onDragStart(event) {
      const payload = { type: item.documentName ?? "Item", uuid: item.uuid };
      event.dataTransfer.setData("text/plain", JSON.stringify(payload));
      if (event.currentTarget instanceof HTMLElement) {
         event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
      }
   }

   function performItemAction() {
      item.parent.sheet.displayRollComposer(ProcedureFactory(item.parent, item));
   }

   async function onTrashClick() {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
         window: { title: localize("sr3e.confirm.destroyTitle") || "Destroy item?" },
         content: `<p>${localize("sr3e.confirm.destroyText") || "This cannot be undone."}</p><p><strong>${item.name}</strong></p>`,
         yes: { label: localize("Delete") || "Delete", icon: "fa-solid fa-trash-can" },
         no: { label: localize("Cancel") || "Cancel" },
         defaultYes: false,
      });
      if (!confirmed) return;
      await item.parent.deleteEmbeddedDocuments("Item", [item.id]);
   }
</script>

<!-- svelte-ignore a11y_unknown_aria_attribute -->
<div data-item-id="{item.id}" class="asset-card" role="presentation" aria-role="presentation" draggable="true" ondragstart={onDragStart}>
   <div class="asset-background-layer"></div>
   <div class="image-mask">
      <img src={item.img} role="presentation" alt={item.name} />
   </div>

   <div class="asset-card-column">
      <div class="asset-card-row">
         <div class="asset-card-column">
            <h3 class="no-margin uppercase">{item.name}</h3>

            {#if hasLinkedSkill}
               <h3 class="no-margin uppercase">
                  {localize(config.skill.skill)}: {linkedSkillName}
               </h3>
            {/if}

            {#if item.type === "weapon"}
               <WeaponComponent {item} {config} {hasAmmo} {isFirearm} />
            {/if}

            {#if item.type === "ammunition"}
               <AmmunitionComponent {item} {config} />
            {/if}

            {#if item.type === "wearable"}
               <WearableComponent {item} {config} />
            {/if}
         </div>
      </div>

      <div class="asset-card-row">
         {#if item.type === "weapon"}
            <button
               class="sr3e-toolbar-button fa-solid fa-dice"
               aria-label="Roll"
               onclick={performItemAction}
               disabled={!hasLinkedSkill || !hasAmmo}
            ></button>
         {/if}

         <button
            class="sr3e-toolbar-button fa-solid fa-pencil"
            aria-label="Edit"
            onclick={() => item.sheet.render(true)}
         ></button>

         {#if isFirearm}
            <button class="sr3e-toolbar-button fa-solid fa-repeat" aria-label="Reload" onclick={onReloadClick}></button>
         {/if}

         <button class="sr3e-toolbar-button fa-solid fa-trash-can" aria-label="Trash" onclick={onTrashClick}></button>
      </div>
   </div>

   <div class="asset-toggles">
      <FilterToggle bind:checked={isFavorite} svgName="star-svgrepo-com.svg" />
      <FilterToggle bind:checked={isEquipped} svgName="backpack-svgrepo-com.svg" />
   </div>
</div>
