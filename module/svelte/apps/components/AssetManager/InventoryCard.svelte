<script>
  import { onMount, onDestroy } from "svelte";
  import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
  import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
  import { localize } from "@services/utilities.js";
  import FirearmService from "@services/FirearmService.js";

  let { item, config } = $props();

  // --- Primary manager: the card’s own item (weapon or ammunition) ---
  const smItem = StoreManager.Subscribe(item);

  // Flags
  let isFavorite = $state(false);
  let isEquipped = $state(false);
  const isFavoriteStore = smItem.GetFlagStore("isFavorite");
  const isEquippedStore = smItem.GetFlagStore("isEquipped");

  // Linked skill subtitle
  const resolvingItemIdStore = smItem.GetRWStore("linkedSkilliD");
  const hasLinkedSkill = $derived(!!$resolvingItemIdStore && $resolvingItemIdStore !== "");
  let resolvingItemName = $state("");

  // --- Ammo following: set up a SECOND manager when needed -------------
  const weaponHasOwnRounds = $derived(
    item.type === "weapon" && foundry.utils.hasProperty(item.system, "rounds")
  );

  // UUID of the loaded ammo (on the WEAPON document)
  const loadedAmmoUuidStore = item.type === "weapon" ? smItem.GetROStore("ammo.uuid") : null;

  // Secondary manager (for ammo doc). Keep it around to unsubscribe cleanly.
  let smAmmo = null;
  let linkedAmmoDoc = null;

  // The STORES we read from (can point to weapon OR ammo document)
  let activeRoundsStore = null;
  let activeMaxCapStore = null;

  // Plain values the UI binds to (avoid subtle store-switching issues)
  let roundsVal = $state(0);
  let maxCapVal = $state(0);

  // Human text + convenience booleans for the UI
  let clipText = $state("-");
  let hasAmmo = $state(true);

  // Decide which document actually drives the rounds/max-capacity
  function useWeaponSelf() {
    if (smAmmo) {
      StoreManager.Unsubscribe(linkedAmmoDoc);
      smAmmo = null;
      linkedAmmoDoc = null;
    }
    activeRoundsStore = smItem.GetROStore("rounds");
    activeMaxCapStore = smItem.GetROStore("maxCapacity");
  }

  function useWeaponMirrors() {
    if (smAmmo) {
      StoreManager.Unsubscribe(linkedAmmoDoc);
      smAmmo = null;
      linkedAmmoDoc = null;
    }
    activeRoundsStore = smItem.GetROStore("ammo.rounds");
    activeMaxCapStore = smItem.GetROStore("ammo.maxCapacity");
  }

  function useAmmoDocument(uuid) {
    const doc = fromUuidSync(uuid);
    if (!doc || !(doc instanceof Item)) {
      // Fall back to mirrors on the weapon if UUID cannot be resolved
      useWeaponMirrors();
      return;
    }
    if (smAmmo && linkedAmmoDoc && linkedAmmoDoc !== doc) {
      StoreManager.Unsubscribe(linkedAmmoDoc);
    }
    linkedAmmoDoc = doc;
    smAmmo = StoreManager.Subscribe(doc);
    activeRoundsStore = smAmmo.GetROStore("rounds");
    activeMaxCapStore = smAmmo.GetROStore("maxCapacity");
  }

  // Switch the active source whenever circumstances change
  $effect(() => {
    if (item.type !== "weapon") {
      // Ammunition (or any non-weapon item): always self
      if (smAmmo) {
        StoreManager.Unsubscribe(linkedAmmoDoc);
        smAmmo = null;
        linkedAmmoDoc = null;
      }
      activeRoundsStore = smItem.GetROStore("rounds");
      activeMaxCapStore = smItem.GetROStore("maxCapacity");
      return;
    }

    // Weapon with self-owned rounds
    if (weaponHasOwnRounds) {
      useWeaponSelf();
      return;
    }

    // Weapon that follows external ammo or mirrors
    const uuid = $loadedAmmoUuidStore;
    if (!uuid) {
      useWeaponMirrors();
      return;
    }

    useAmmoDocument(uuid);
  });

  // Read current store values into plain state
  $effect(() => {
    roundsVal = activeRoundsStore ? ($activeRoundsStore ?? 0) : 0;
  });

  $effect(() => {
    maxCapVal = activeMaxCapStore ? ($activeMaxCapStore ?? 0) : 0;
  });

  // Compute display text + button enablement
  $effect(() => {
    if (!Number.isFinite(roundsVal) && !Number.isFinite(maxCapVal)) {
      clipText = "-";
    } else if (!Number.isFinite(maxCapVal)) {
      clipText = `${roundsVal}`;
    } else {
      clipText = `${roundsVal}/${maxCapVal}`;
    }
  });

  $effect(() => {
    hasAmmo = item.type !== "weapon" ? true : (roundsVal > 0);
  });

  // Flags sync
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

    const [skillId, specIndexRaw] = $resolvingItemIdStore.split("::");
    const skill = item.parent?.items?.get(skillId);
    if (!skill) return;

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

    const idx = Number.parseInt(specIndexRaw);
    const spec = Number.isFinite(idx) ? specs[idx] : null;
    resolvingItemName = spec ? `${skill.name} - ${spec.name}` : skill.name;
  });

  onDestroy(() => {
    StoreManager.Unsubscribe(item);
    if (smAmmo) StoreManager.Unsubscribe(linkedAmmoDoc);
  });

  // Actions
  async function onReloadClick() {
    await FirearmService.reloadWeapon(item.parent, item);
    // After reload, if a new ammo UUID was set, the $loadedAmmoUuidStore will change,
    // which triggers the source-switch effect above and pulls fresh values.
  }

  function onDragStart(event) {
    const payload = { type: item.documentName ?? "Item", uuid: item.uuid };
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
    if (event.currentTarget instanceof HTMLElement) {
      event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
    }
  }

  function performItemAction() {
    if (item.type === "weapon" && !hasAmmo) {
      ui.notifications?.warn(localize("sr3e.notifications.outOfAmmo") || "Out of ammo. Reload first.");
      return;
    }

    const actor = item.parent;
    const linked = item.system.linkedSkillId ?? item.system.linkedSkilliD ?? "";
    if (!linked) return;

    const [skillId, specIndexRaw] = linked.split("::");
    const skill = actor?.items?.get(skillId);
    if (!skill) return;

    const skillType = skill.system.skillType;
    const skillData = skill.system[`${skillType}Skill`];
    if (!skillData) return;

    const idx = Number.parseInt(specIndexRaw);
    const spec = Number.isFinite(idx) ? skillData.specializations?.[idx] : null;
    const dice = spec ? spec.value : (skillData.value ?? 0);

    const caller = {
      type: "item",
      key: item.id,
      value: 0,
      dice,
      skillId,
      skillName: skill.name,
      specializationName: spec ? spec.name : undefined,
      itemName: item.name,
      item,
      isDefaulting: item.system.isDefaulting,
    };

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
          <h3 class="no-margin uppercase">
            {localize(config.skill.skill)}: {resolvingItemName}
          </h3>
        {/if}

        {#if item.type === "weapon"}
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
      {#if item.type === "weapon"}
        <button
          class="sr3e-toolbar-button fa-solid fa-dice"
          aria-label="Roll"
          onclick={performItemAction}
          disabled={!hasLinkedSkill || (item.type === "weapon" && !hasAmmo)}
        ></button>
      {/if}

      <button
        class="sr3e-toolbar-button fa-solid fa-pencil"
        aria-label="Edit"
        onclick={() => item.sheet.render(true)}
      ></button>

      {#if item.type === "weapon"}
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
