<script>
   import { onMount, onDestroy } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import { localize } from "@services/utilities.js";
   import FirearmService from "@services/FirearmService.js";

   let { item, config } = $props();

   const mainItemsStore = StoreManager.Subscribe(item);

   // Flags
   let isFavorite = $state(false);
   let isEquipped = $state(false);
   const isFavoriteStore = mainItemsStore.GetFlagStore("isFavorite");
   const isEquippedStore = mainItemsStore.GetFlagStore("isEquipped");

   // Linked skill
   const linkedSkillIdStore = mainItemsStore.GetRWStore("linkedSkillId");
   const hasLinkedSkill = $derived(!!$linkedSkillIdStore && $linkedSkillIdStore !== "");
   let linkedSkillName = $state("");

   // Ammo tracking - direct document approach
   let smAmmo = null;
   let linkedAmmoDoc = null;

   const isWeapon = item.type === "weapon";
   const hasOwnRounds = $derived(isWeapon && foundry.utils.hasProperty(item.system, "rounds"));
   // Use RW stores for reactive tracking; they are safe for read-only access
   const loadedAmmoUuidStore = isWeapon ? mainItemsStore.GetRWStore("ammoId") : "";

   // Active stores for rounds/capacity - always point to the source document
   let activeRoundsStore = null;
   let activeMaxCapStore = null;
   let roundsVal = $state(0);
   let maxCapVal = $state(0);

   // UI state
   let clipText = $state("-");
   let hasAmmo = $state(true);

   function cleanupAmmoManager() {
      if (smAmmo && linkedAmmoDoc) {
         StoreManager.Unsubscribe(linkedAmmoDoc);
         smAmmo = null;
         linkedAmmoDoc = null;
      }
   }

   function useItemSelf() {
      cleanupAmmoManager();
      // RW stores ensure reliable updates even when used read-only
      activeRoundsStore = mainItemsStore.GetRWStore("rounds");
      activeMaxCapStore = mainItemsStore.GetRWStore("maxCapacity");
   }

   function useAmmoDocument(uuid) {
      cleanupAmmoManager();

      // Always instantiate the ammo document - no mirroring fallback
      const doc = fromUuidSync(uuid);
      linkedAmmoDoc = doc;
      smAmmo = StoreManager.Subscribe(doc);
      // Subscribing via RW stores keeps the weapon and ammo cards in sync
      activeRoundsStore = smAmmo.GetRWStore("rounds");
      activeMaxCapStore = smAmmo.GetRWStore("maxCapacity");
   }

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

   // Sync store values to state
   $effect(() => {
      roundsVal = activeRoundsStore ? $activeRoundsStore : 0;
   });

   $effect(() => {
      maxCapVal = activeMaxCapStore ? $activeMaxCapStore : 0;
   });

   // Update UI state
   $effect(() => {
      if (maxCapVal === 0 && roundsVal === 0) {
         clipText = "-";
      } else if (maxCapVal === 0) {
         clipText = `${roundsVal}`;
      } else {
         clipText = `${roundsVal}/${maxCapVal}`;
      }
   });

   $effect(() => {
      hasAmmo = !isWeapon || roundsVal > 0;
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

   // Resolve linked skill name
   $effect(() => {
      if (!hasLinkedSkill) {
         linkedSkillName = "";
         return;
      }

      const raw = $linkedSkillIdStore ?? "";
      const [skillId, specIndexRaw] = raw.split("::");
      const skill = item.parent?.items?.get(skillId);
      if (!skill) {
         linkedSkillName = "";
         return;
      }

      const skillSystem = skill.system;
      const skillType = skillSystem.skillType;
      const skillData = skillSystem[`${skillType}Skill`];
      const specs = skillData.specializations ?? [];

      const specIndex = Number.parseInt(specIndexRaw);
      const spec = Number.isFinite(specIndex) ? specs[specIndex] : null;
      linkedSkillName = spec ? `${skill.name} - ${spec.name}` : skill.name;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(item);
      cleanupAmmoManager();
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
      if (isWeapon && !hasAmmo) {
         ui.notifications.warn(localize("sr3e.notifications.outOfAmmo") || "Out of ammo. Reload first.");
         return;
      }

      const actor = item.parent;
      const [skillId, specIndexRaw] = ($linkedSkillIdStore ?? "").split("::");
      const skill = actor.items.get(skillId);

      const skillType = skill?.system?.skillType;
      const skillData = skillType ? skill.system[`${skillType}Skill`] : {};
      const specs = skillData?.specializations ?? [];

      const specIndex = Number.parseInt(specIndexRaw);
      const spec = Number.isFinite(specIndex) ? specs[specIndex] : null;
      const dice = spec?.value ?? skillData?.value ?? 0;

      const caller = {
         type: "item",
         key: item.id,
         value: 0,
         dice,
         skillId: skillId ?? "",
         skillName: skill?.name ?? "",
         specializationName: spec?.name ?? "",
         itemName: item.name,
         item,
         isDefaulting: item.system.isDefaulting,
      };

      actor.sheet.setRollComposerData(caller);
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
<div class="asset-card" role="presentation" aria-role="presentation" draggable="true" ondragstart={onDragStart}>
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

            {#if isWeapon}
               <h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>
               <h4 class="no-margin uppercase">
                  {localize(config.ammunition.rounds)}: {clipText}
               </h4>
            {/if}

            {#if item.type === "ammunition"}
               <h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>
               <h4 class="no-margin uppercase">
                  {localize(config.ammunition.rounds)}: {clipText}
               </h4>
            {/if}
         </div>
      </div>

      <div class="asset-card-row">
         {#if isWeapon}
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

         {#if isWeapon}
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
