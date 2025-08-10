<script>
  import { localize, openFilePicker } from "@services/utilities.js";
  import { onDestroy, onMount } from "svelte";
  import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import Commodity from "@sveltecomponent/Commodity.svelte";
  import Portability from "@sveltecomponent/Portability.svelte";
  import Image from "@sveltecomponent/basic/Image.svelte";
  import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
  import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
  import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
  import GadgetViewer from "@sveltecomponent/GadgetViewer.svelte";
  import ComboSearch from "@sveltecomponent/basic/ComboSearch.svelte";
  import { StoreManager } from "../svelteHelpers/StoreManager.svelte";

  // Props (runes)
  let { item = {}, config = {} } = $props();

  // Local state (runes)
  let name = $state(item.name);
  const system = $state(item.system);

  // -----------------------------
  // Helper: build {value,label} options from i18n maps
  // Keys are persisted to data; labels are localized for UI.
  // -----------------------------
  function kvOptions(obj) {
    // expect obj like: { key: "i18n.token", ... }
    return Object.entries(obj ?? {}).map(([value, token]) => ({
      value,
      label: localize(token)
    }));
  }

  // Linked skill selection (via ComboSearch)
  let allSkillsMap = new Map();
  let options = $state([]); // options for ComboSearch (already {value,label})
  let comboSearchValue = $state(system.linkedSkilliD);

  // Store wiring
  let storeManager = StoreManager.Subscribe(item);
  let skillIdStore = storeManager.GetRWStore("linkedSkilliD");

  onDestroy(() => {
    StoreManager.Unsubscribe(item);
  });

  // Keep store in sync with UI state
  $effect(() => {
    $skillIdStore = comboSearchValue;
  });

  // Persist skill selection (no re-render)
  $effect(() => {
    item.update({ ["system.linkedSkilliD"]: comboSearchValue }, { render: false });
  });

  // Build skill + specialization options from parent
  function updateSkillOptions() {
    const parent = item.parent;
    if (!parent) return;

    const skills = parent.items.filter((i) => i.type === "skill");

    const newOptions = [];
    const newMap = new Map();

    for (const skill of skills) {
      const baseLabel = skill.name;
      newOptions.push({ value: skill.id, label: baseLabel });
      newMap.set(skill.id, baseLabel);

      const sys = skill.system;
      let specializations = [];

      switch (sys.skillType) {
        case "active":
          specializations = sys.activeSkill?.specializations || [];
          break;
        case "knowledge":
          specializations = sys.knowledgeSkill?.specializations || [];
          break;
        case "language":
          specializations = sys.languageSkill?.specializations || [];
          break;
      }

      for (let i = 0; i < specializations.length; i++) {
        const spec = specializations[i];
        const id = `${skill.id}::${i}`;
        const label = `${baseLabel} - ${spec.name}`;
        newOptions.push({ value: id, label });
        newMap.set(id, label);
      }
    }

    allSkillsMap = newMap;
    options = newOptions;
  }

  onMount(() => {
    updateSkillOptions();

    // Observe mutations on embedded items
    const collection = item.parent?.items.collection;
    if (collection) {
      collection.on("update", updateSkillOptions);
      collection.on("create", updateSkillOptions);
      collection.on("delete", updateSkillOptions);
    }

    return () => {
      collection?.off("update", updateSkillOptions);
      collection?.off("create", updateSkillOptions);
      collection?.off("delete", updateSkillOptions);
    };
  });

  // -----------------------------
  // Sheet fields (derived descriptors for <StatCard/>)
  // -----------------------------

  const isDefaulting = $derived({
    item,
    key: "isDefaulting",
    label: localize(config.common.isdefaulting),
    value: system.isDefaulting,
    path: "system",
    type: "checkbox"
  });

  // Use kvOptions so the sheet shows localized labels but stores canonical keys.
  const reloadMechanism = $derived({
    item,
    key: "reloadMechanism",
    label: localize(config.weapon.reloadMechanism),
    value: system.reloadMechanism,
    path: "system",
    type: "select",
    options: kvOptions(config.reloadMechanism)
  });

  const weaponMode = $derived({
    item,
    key: "mode",
    label: localize(config.weapon.mode),
    value: system.mode,
    path: "system",
    type: "select",
    options: kvOptions(config.weaponMode)
  });

  const ammoClassEntry = $derived({
    item,
    key: "ammunitionClass",
    label: localize(config.weapon.ammunitionClass),
    value: system.ammunitionClass,
    path: "system",
    type: "select",
    options: kvOptions(config.ammunitionClass)
  });

  const damageTypeEntry = $derived({
    item,
    key: "damageType",
    label: localize(config.weapon.damageType),
    value: system.damageType,
    path: "system",
    type: "select",
    options: kvOptions(config.damageType)
  });

  const rangeBandEntries = [
    {
      item,
      key: "rangeBand.short",
      label: localize(config.weapon.rangebandshort),
      value: system.rangeBand.short,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "rangeBand.medium",
      label: localize(config.weapon.rangebandmedium),
      value: system.rangeBand.medium,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "rangeBand.long",
      label: localize(config.weapon.rangebandlong),
      value: system.rangeBand.long,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "rangeBand.extreme",
      label: localize(config.weapon.rangebandextreme),
      value: system.rangeBand.extreme,
      path: "system",
      type: "number"
    }
  ];

  const weaponEntries = [
    {
      item,
      key: "damage",
      label: localize(config.weapon.damage),
      value: system.damage,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "range",
      label: localize(config.weapon.range),
      value: system.range,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "recoilComp",
      label: localize(config.weapon.recoilCompensation),
      value: system.recoilComp,
      path: "system",
      type: "number"
    }
  ];
</script>

<ItemSheetWrapper csslayout={"double"}>
  <ItemSheetComponent>
    <Image entity={item} />
    <div class="stat-grid single-column">
      <input
        class="large"
        name="name"
        type="text"
        value={name}
        onchange={(e) => item.update({ ["name"]: e.target.value })}
      />
    </div>

    {#if item.parent}
      <div class="stat-card">
        <div class="stat-card-background"></div>
        <h3>Skill for resolving rolls</h3>
        <ComboSearch
          bind:value={comboSearchValue}
          {options}
          placeholder="Select linked skill..."
          nomatchplaceholder="No matching skill"
          disabled={!options.length}
        />
        <div class="stat-grid single-column">
          <StatCard {...isDefaulting} />
        </div>
      </div>
    {/if}
  </ItemSheetComponent>

  <ItemSheetComponent>
    <h3>{localize(config.common.details)}</h3>
    <div class="stat-grid single-column">
      <StatCard {...weaponMode} />
      <StatCard {...damageTypeEntry} />
      <StatCard {...ammoClassEntry} />
      <StatCard {...reloadMechanism} />
    </div>

    <div class="stat-grid two-column">
      {#each weaponEntries as entry}
        <StatCard {...entry} />
      {/each}
    </div>
  </ItemSheetComponent>

  <ItemSheetComponent>
    <h3>{localize(config.weapon.rangeband)}</h3>
    <div class="stat-grid two-column">
      {#each rangeBandEntries as entry}
        <StatCard {...entry} />
      {/each}
    </div>
  </ItemSheetComponent>

  <ItemSheetComponent>
    <div>
      <h3>{localize(config.gadget.gadget)}</h3>
    </div>
    <GadgetViewer document={item} {config} isSlim={true} />
  </ItemSheetComponent>

  <ItemSheetComponent>
    <ActiveEffectsViewer document={item} {config} isSlim={true} />
  </ItemSheetComponent>

  <Commodity {item} {config} gridCss="two-column" />
  <Portability {item} {config} gridCss="two-column" />
  <JournalViewer document={item} {config} />
</ItemSheetWrapper>
