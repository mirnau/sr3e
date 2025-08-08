<script>
   import { onDestroy, onMount } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import { localize } from "@services/utilities.js";
   import SR3ERoll from "@documents/SR3ERoll.js";
   import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";

   let { item, config } = $props();
   const inventoryCardStoreManager = StoreManager.Subscribe(item);

   let isFavorite = $state(false);
   let isEquipped = $state(false);

   const resolvingItemIdStore = inventoryCardStoreManager.GetRWStore("linkedSkilliD");
   const hasLinkedSkill = $derived($resolvingItemIdStore && $resolvingItemIdStore !== "");
   let resolvingItemName = $state("");

   const isFavoriteStore = inventoryCardStoreManager.GetFlagStore("isFavorite");
   const isEquippedStore = inventoryCardStoreManager.GetFlagStore("isEquipped");

   onMount(() => {
      isFavorite = $isFavoriteStore;
      isEquipped = $isEquippedStore;
   });

   $effect(() => {
      $isFavoriteStore = isFavorite;
      $isEquippedStore = isEquipped;
   });

   $effect(() => {
      if (!hasLinkedSkill) return;

      const [skillId, specIndex] = $resolvingItemIdStore.split("::");
      const skill = item.parent.items.get(skillId);
      if (!skill) return;

      if (specIndex !== undefined) {
         let specs = [];
         switch (skill.system.skillType) {
            case "active":
               specs = skill.system.activeSkill?.specializations ?? [];
               break;
            case "knowledge":
               specs = skill.system.knowledgeSkill?.specializations ?? [];
               break;
            case "language":
               specs = skill.system.languageSkill?.specializations ?? [];
               break;
         }

         const spec = specs[parseInt(specIndex)];
         if (spec) {
            resolvingItemName = `${skill.name} - ${spec.name}`;
            return;
         }
      }

      resolvingItemName = skill.name;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(item);
   });

   function onDragStart(event) {
      const payload = {
         type: item.documentName ?? "Item",
         uuid: item.uuid,
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(payload));
      if (event.currentTarget instanceof HTMLElement) {
         event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
      }
   }
   function performItemAction() {
      const actor = item.parent;
      const linked = item.system.linkedSkillId ?? item.system.linkedSkilliD ?? "";
      const [skillId, specIndex] = linked.split("::");
      const skill = actor.items.get(skillId);
      const skillData = skill.system.activeSkill;

      const spec = Number.isFinite(parseInt(specIndex)) ? skillData.specializations[parseInt(specIndex)] : null;
      const dice = spec ? spec.value : skillData.value;

      const caller = {
         callerType: "item",
         key: item.id,
         value: 0,
         dice,
         skillId,
         skillName: skill.name,
         specializationName: spec ? spec.name : undefined,
         itemName: item.name,
         item,
      };

      openRollComposer(actor, caller);
   }

   function openRollComposer(actor, caller) {
      actor.sheet.setRollComposerData(caller);
   }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="asset-card" draggable="true" ondragstart={onDragStart}>
   <div class="asset-background-layer"></div>
   <div class="image-mask">
      <img src={item.img} role="presentation" alt={item.name} />
   </div>
   <div class="asset-card-column">
      <div class="asset-card-row">
         <div class="asset-card-column">
            <h3 class="no-margin uppercase">{item.name}</h3>
            {#if hasLinkedSkill}
               <h3 class="no-margin uppercase">{localize(config.skill.skill)}: {resolvingItemName}</h3>
            {/if}
            {#if item.type === "weapon"}
               <h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>
            {/if}
         </div>
      </div>
      <div class="asset-card-row">
         <button
            class="sr3e-toolbar-button fa-solid fa-dice"
            aria-label="Roll"
            onclick={performItemAction}
            disabled={!hasLinkedSkill}
         ></button>

         <button
            class="sr3e-toolbar-button fa-solid fa-pencil"
            aria-label="Edit"
            onclick={() => item.sheet.render(true)}
         ></button>
         {#if item.type === "weapon"}
            <button
               class="sr3e-toolbar-button fa-solid fa-repeat"
               aria-label="Trash"
               onclick={() => console.log("Reload")}
            ></button>
         {/if}
         <button
            class="sr3e-toolbar-button fa-solid fa-trash-can"
            aria-label="Trash"
            onclick={() => console.log("Trash")}
         ></button>
      </div>
   </div>
   <div class="asset-toggles">
      <FilterToggle bind:checked={isFavorite} svgName="star-svgrepo-com.svg" />
      <FilterToggle bind:checked={isEquipped} svgName="backpack-svgrepo-com.svg" />
   </div>
</div>
