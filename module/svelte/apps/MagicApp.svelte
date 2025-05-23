<script>
  import { localize, openFilePicker } from "../../svelteHelpers.js";
  import StatCard from "./components/StatCard.svelte";
  import JournalViewer from "./components/JournalViewer.svelte";

  let { item = {}, config = {} } = $props();

  const system = $state(item.system);
  const awakened = $state(system.awakened);
  const magicianData = $state(system.magicianData);
  const adeptData = $state(awakened.adeptData);
  const labels = config.magic;

  const archetypeOptions = [
    localize(labels.adept),
    localize(labels.magician),
  ];

  const magicianTypeOptions = [
    localize(labels.fullmage),
    localize(labels.aspectedmage),
  ];

  const aspectsOptions = [
    localize(labels.conjurer),
    localize(labels.sorcerer),
    localize(labels.elementalist),
    localize(config.common.custom),
  ];

  const resistanceAttributeOptions = [
    localize(config.attributes.willpower),
    localize(config.attributes.charisma),
    localize(config.attributes.intelligence),
  ];

  const traditionOptions = [
    localize(labels.hermetic),
    localize(labels.shamanic),
    localize(config.common.other),
  ];

  const archetype = $derived({
    item,
    key: "archetype",
    label: localize(labels.archetype),
    value: awakened.archetype,
    path: "system.awakened",
    type: "select",
    options: archetypeOptions,
  });

  const priority = $derived({
    item,
    key: "priority",
    label: localize(labels.priority),
    value: awakened.priority,
    path: "system.awakened",
    type: "select",
    options: ["A", "B"],
  });

  const magicianType = $derived({
    item,
    key: "magicianType",
    label: localize(labels.magicianType),
    value: magicianData.magicianType,
    path: "system.magicianData",
    type: "select",
    options: magicianTypeOptions,
  });

  const aspect = $derived({
    item,
    key: "aspect",
    label: localize(labels.aspect),
    value: magicianData.aspect,
    path: "system.magicianData",
    type: "select",
    options: aspectsOptions,
  });

  const magicianFields = $derived([
    {
      item,
      key: "tradition",
      label: localize(labels.tradition),
      value: magicianData.tradition,
      path: "system.magicianData",
      type: "select",
      options: traditionOptions,
    },
    {
      item,
      key: "drainResistanceAttribute",
      label: localize(labels.drainResistanceAttribute),
      value: magicianData.drainResistanceAttribute,
      path: "system.magicianData",
      type: "select",
      options: resistanceAttributeOptions,
    },
    {
      item,
      key: "canAstrallyProject",
      label: localize(labels.canAstrallyProject),
      value: magicianData.canAstrallyProject,
      path: "system.magicianData",
      type: "checkbox",
      options: [],
    },
    {
      item,
      key: "totem",
      label: localize(labels.totem),
      value: magicianData.totem ?? localize(labels.shamannote),
      path: "system.magicianData",
      type: "text",
      options: [],
    },
  ]);

  const adeptFields = $derived([]); // Extend later if needed

  let isAspected = $state(false);
  $effect(() => {
    isAspected = magicianType.value === localize(labels.aspectedmage);
  });
</script>

<div class="meta-human-grid">
  <!-- Header -->
  <div class="item-sheet-component">
    <div class="sr3e-inner-background-container">
      <div class="fake-shadow"></div>
      <div class="sr3e-inner-background">
        <div class="image-mask">
          <img
            src={item.img}
            role="presentation"
            data-edit="img"
            title={item.name}
            alt={item.name}
            onclick={openFilePicker(item)}
          />
        </div>
        <input
          class="large"
          name="name"
          type="text"
          bind:value={item.name}
          onchange={(e) => item.update({ name: e.target.value })}
        />
        <StatCard {...archetype} />
        <StatCard {...priority} />
      </div>
    </div>
  </div>

  <!-- Magician UI -->
  {#if awakened.archetype === archetype.options[1]}
    <div class="item-sheet-component">
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          <StatCard {...magicianType} />
        </div>
      </div>
    </div>

    {#if isAspected}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <StatCard {...aspect} />
          </div>
        </div>
      </div>
    {/if}

    {#each magicianFields as entry}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <StatCard {...entry} />
          </div>
        </div>
      </div>
    {/each}

  <!-- Adept UI -->
  {:else if awakened.archetype === archetype.options[0]}
    {#each adeptFields as entry}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <StatCard {...entry} />
          </div>
        </div>
      </div>
    {/each}
  {/if}

  <!-- Journal -->
  <div class="item-sheet-component">
    <div class="sr3e-inner-background-container">
      <div class="fake-shadow"></div>
      <div class="sr3e-inner-background">
        <JournalViewer {item} {config} />
      </div>
    </div>
  </div>
</div>