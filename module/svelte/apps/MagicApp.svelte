<script>
  import { localize, openFilePicker } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/StatCard.svelte";
  import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
  import Image from "@sveltecomponent/basic/Image.svelte";
  import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
     import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";

  let { item = {}, config = {} } = $props();

  const system = $state(item.system);
  const awakened = $state(system.awakened);
  const magicianData = $state(system.magicianData);
  const adeptData = $state(awakened.adeptData);
  const labels = config.magic;


  const archetypeOptions = [localize(labels.adept), localize(labels.magician)];

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

<ItemSheetWrapper csslayout={"double"}>
    <!-- Header -->
    <ItemSheetComponent>
      <Image entity={item}/>
      <div class="stat-grid single-column">
        <StatCard>
          <input
            bind:value={item.name}
            onchange={(e) => item.update({ name: e.target.value })}
          />
        </StatCard>
        <StatCard {...archetype} />
        <StatCard {...priority} />
      </div>
    </ItemSheetComponent>

    <!-- Magician UI -->
    {#if awakened.archetype === archetype.options[1]}
      <ItemSheetComponent>
        <StatCard {...magicianType} />
      </ItemSheetComponent>

      {#if isAspected}
        <ItemSheetComponent>
          <StatCard {...aspect} />
        </ItemSheetComponent>
      {/if}

      {#each magicianFields as entry}
        <ItemSheetComponent>
          <StatCard {...entry} />
        </ItemSheetComponent>
      {/each}

      <!-- Adept UI -->
    {:else if awakened.archetype === archetype.options[0]}
      {#each adeptFields as entry}
        <ItemSheetComponent>
          <StatCard {...entry} />
        </ItemSheetComponent>
      {/each}
    {/if}

    <JournalViewer document={item} {config} />
</ItemSheetWrapper>
