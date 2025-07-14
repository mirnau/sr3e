<script>
  import { localize, openFilePicker } from "../../services/utilities.js";
  import StatCard from "./components/StatCard.svelte";
  import Commodity from "./components/Commodity.svelte";
  import Portability from "./components/Portability.svelte";
  import JournalViewer from "./components/JournalViewer.svelte";
  import Image from "./components/basic/Image.svelte";
  import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";

  let { item = {}, config = {} } = $props();
  const ammunition = item.system;
  let layoutMode = $state("single");

  const ammoEntries = [
    {
      item,
      key: "type",
      label: localize(config.ammunition.type),
      value: ammunition.type,
      path: "system.ammunition",
      type: "text",
    },
    {
      item,
      key: "rounds",
      label: localize(config.ammunition.rounds),
      value: ammunition.rounds,
      path: "system.ammunition",
      type: "number",
    },
  ];
</script>

<div class="sr3e-waterfall-wrapper">
  <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
    <ItemSheetComponent>
      <Image src={item.img} title={item.name} />
      <input
        bind:value={item.name}
        onchange={(e) => item.update({ name: e.target.value })}
      />
      <div class="stat-grid two-column">
        {#each ammoEntries as entry}
          <StatCard {...entry} />
        {/each}
      </div>
    </ItemSheetComponent>

    <Commodity {item} {config} gridCss="two-column" />
    <Portability {item} {config} gridCss="two-column" />
    <JournalViewer document={item} {config} />
  </div>
</div>
