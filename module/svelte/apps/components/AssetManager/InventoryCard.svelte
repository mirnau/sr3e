<script>
  import { onMount, onDestroy } from "svelte";
  import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
  import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
  import { localize } from "@services/utilities.js";
  import FirearmService from "@services/FirearmService.js";

  let { item, config } = $props();

  const smItem = StoreManager.Subscribe(item);

  // Flags
  let isFavorite = $state(false);
  let isEquipped = $state(false);
  const isFavoriteStore = smItem.GetFlagStore("isFavorite");
  const isEquippedStore = smItem.GetFlagStore("isEquipped");

  // Linked skill
  const linkedSkillIdStore = smItem.GetRWStore("linkedSkilliD");
  const hasLinkedSkill = $derived(!!$linkedSkillIdStore && $linkedSkillIdStore !== "");
  let linkedSkillName = $state("");

  // Ammo tracking - direct document approach
  let smAmmo = null;
  let linkedAmmoDoc = null;
  
  const isWeapon = item.type === "weapon";
  const hasOwnRounds = $derived(isWeapon && foundry.utils.hasProperty(item.system, "rounds"));
  const loadedAmmoUuidStore = isWeapon ? smItem.GetROStore("ammo.uuid") : null;

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
    activeRoundsStore = smItem.GetROStore("rounds");
    activeMaxCapStore = smItem.GetROStore("maxCapacity");
  }

  function useAmmoDocument(uuid) {
    cleanupAmmoManager();
    
    // Always instantiate the ammo document - no mirroring fallback
    const doc = fromUuidSync(uuid);
    linkedAmmoDoc = doc;
    smAmmo = StoreManager.Subscribe(doc);
    activeRoundsStore = smAmmo.GetROStore("rounds");
    activeMaxCapStore = smAmmo.GetROStore("maxCapacity");
  }

  // Determine active ammo source - simplified without mirrors
  $effect(() => {
    if (!isWeapon || hasOwnRounds) {
      // Non-weapons or weapons with self-contained rounds
      useItemSelf();
      return;
    }

    // Weapon uses external ammo - always load the actual document
    const uuid = $loadedAmmoUuidStore;
    if (uuid) {
      useAmmoDocument(uuid);
    } else {
      // No ammo loaded - weapon shows 0/0
      cleanupAmmoManager();
      activeRoundsStore = null;
      activeMaxCapStore = null;
    }
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
    if (!hasLinkedSkill) return;

    const [skillId, specIndexRaw] = $linkedSkillIdStore.split("::");
    const skill = item.parent.items.get(skillId);
    
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
    const linkedSkillId = item.system.linkedSkillId ?? item.system.linkedSkilliD ?? "";
    
    const [skillId, specIndexRaw] = linkedSkillId.split("::");
    const skill = actor.items.get(skillId);
    const skillType = skill.system.skillType;
    const skillData = skill.system[`${skillType}Skill`];
    
    const specIndex = Number.parseInt(specIndexRaw);
    const spec = Number.isFinite(specIndex) ? skillData.specializations[specIndex] : null;
    const dice = spec ? spec.value : skillData.value;

    const caller = {
      type: "item",
      key: item.id,
      value: 0,
      dice,
      skillId,
      skillName: skill.name,
      specializationName: spec?.name,
      itemName: item.name,
      item,
      isDefaulting: item.system.isDefaulting,
    };

    actor.sheet.setRollComposerData(caller);
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
        <button
          class="sr3e-toolbar-button fa-solid fa-repeat"
          aria-label="Reload"
          onclick={onReloadClick}
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