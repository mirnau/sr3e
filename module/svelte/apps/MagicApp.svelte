<script>
  import { localize, openFilePicker } from "../../svelteHelpers.js";
  import StatCard from "./components/StatCard.svelte";
  import JournalViewer from "./components/JournalViewer.svelte";

  let { item = {}, config = {} } = $props();

  const system = $state(item.system);
  const awakened = system.awakened || {};
  const magicianData = $state(system.magicianData);
  const adeptData = awakened.adeptData || {};
  const labels = config.magic || {};

  const priorityOptions = ["A", "B"];

  const archetypeOptions = [
    localize(config.magic.adept),
    localize(config.magic.magician),
  ];

  const magicianTypeOptions = [
    localize(config.magic.fullmage),
    localize(config.magic.aspectedmage),
  ];

  const aspectsOptions = [
    localize(config.magic.conjurer),
    localize(config.magic.sorcerer),
    localize(config.magic.elementalist),
    localize(config.common.custom),
  ];

  const resistanceAttributeOptions = [
    localize(config.attributes.willpower),
    localize(config.attributes.charisma),
    localize(config.attributes.intelligence),
  ];

  const traditionOptions = [
    localize(config.magic.hermetic),
    localize(config.magic.shamanic),
    localize(config.common.other),
  ];

  let archetype = $state(awakened.archetype);
  const archetypeEntry = {
    key: "archetype",
    label: localize(labels.archetype),
    value: archetype,
    type: "select",
    options: archetypeOptions,
  };

  let priority = $state(awakened.priority);
  const priorityEntry = {
    key: "priority",
    label: localize(labels.priority),
    value: priority,
    type: "select",
    options: priorityOptions,
  };

  let magicianType = $state(magicianData.magicianType);
  let aspect = $state(magicianData.aspect);
  let tradition = $state(magicianData.tradition);
  let drainResistanceAttribute = $state(magicianData.drainResistanceAttribute);
  let canAstrallyProject = $state(magicianData.canAstrallyProject);
  let totem = $state(magicianData.totem ?? localize(config.magic.shamannote));

  const magicianFields = [
    {
      key: "tradition",
      label: localize(labels.tradition),
      value: tradition,
      type: "select",
      options: traditionOptions,
    },
    {
      key: "drainResistanceAttribute",
      label: localize(labels.drainResistanceAttribute),
      value: drainResistanceAttribute,
      type: "select",
      options: resistanceAttributeOptions,
    },
    {
      key: "canAstrallyProject",
      label: localize(labels.canAstrallyProject),
      value: canAstrallyProject,
      type: "checkbox",
    },
    {
      key: "totem",
      label: localize(labels.totem),
      value: totem,
      type: "text",
    },
  ];

  const adeptFields = [];

  let isAspected = $derived(
    magicianType === localize(config.magic.aspectedmage),
  );

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
        <StatCard
          {item}
          entry={archetypeEntry}
          path="system.awakened"
          type="select"
          options={archetypeOptions}
        />
        <StatCard
          {item}
          entry={priorityEntry}
          path="system.awakened"
          type="select"
          options={priorityOptions}
        />
      </div>
    </div>
  </div>

  <!-- Magician UI -->
  {#if awakened.archetype === archetypeOptions[1]}
    <!-- magicianType statcard -->
    <div class="item-sheet-component">
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          <StatCard
            {item}
            entry={{
              key: "magicianType",
              label: localize(labels.magicianType),
              value: magicianType,
            }}
            path="system.magicianData"
            type="select"
            options={magicianTypeOptions}
          />
        </div>
      </div>
    </div>

    <!-- aspect statcard -->
    {#if !isAspected}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <StatCard
              {item}
              entry={{
                key: "aspect",
                label: localize(labels.aspect),
                value: aspect,
              }}
              path="system.magicianData"
              type="select"
              options={aspectsOptions}
            />
          </div>
        </div>
      </div>
    {/if}

    {#each magicianFields as entry}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <h3 class="item">{entry.label}</h3>
            <StatCard
              {item}
              {entry}
              path={`system.magicianData`}
              type={entry.type}
              options={entry.options}
            />
          </div>
        </div>
      </div>
    {/each}

    <!-- Adept UI -->
  {:else if awakened.archetype === archetypeOptions[0]}
    {#each adeptFields as entry}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <h3 class="item">{entry.label}</h3>
            <StatCard
              {item}
              {entry}
              path={`system.awakened.adeptData`}
              type={entry.type}
              options={entry.options}
            />
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
