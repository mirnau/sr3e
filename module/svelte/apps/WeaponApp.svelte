<script>
  import { localize, openFilePicker } from "../../svelteHelpers.js";
  import { onMount } from "svelte";
  import JournalViewer from "./components/JournalViewer.svelte";
  import StatCard from "./components/StatCard.svelte";
  import Commodity from "./components/Commodity.svelte";
  import Portability from "./components/Portability.svelte";
  import Image from "./components/basic/Image.svelte";
  import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";

  let layoutMode = $state("double");
  let { item = {}, config = {} } = $props();
  const system = $state(item.system);
  const weapon = system.weapon;

  const weaponMode = {
    item,
    key: "mode",
    label: "Mode",
    value: weapon.mode,
    path: "system.weapon",
    type: "select",
    options: [
      localize(config.weapon.manual),
      localize(config.weapon.semiauto),
      localize(config.weapon.fullauto),
      localize(config.weapon.blade),
      localize(config.weapon.explosive),
      localize(config.weapon.energy),
      localize(config.weapon.blunt),
    ],
  };

  const weaponEntries = [
    {
      item,
      key: "damage",
      label: localize(config.weapon.damage),
      value: weapon.damage,
      path: "system.weapon",
      type: "text",
    },
    {
      item,
      key: "range",
      label: localize(config.weapon.range),
      value: weapon.range,
      path: "system.weapon",
      type: "number",
    },
    {
      item,
      key: "recoilComp",
      label: localize(config.weapon.recoilCompensation),
      value: weapon.recoilComp,
      path: "system.weapon",
      type: "number",
    },
    {
      item,
      key: "currentClipId",
      label: localize(config.weapon.currentClip),
      value: weapon.currentClipId,
      path: "system.weapon",
      type: "text",
    },
  ];
</script>

<div class="sr3e-waterfall-wrapper">
  <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
    <ItemSheetComponent>
      <Image src={item.img} title={item.name} />
      <div class="stat-grid single-column">
        <StatCard>
          <input
          class="large"
          name="name"
          type="text"
          bind:value={item.name}
          onchange={(e) => item.update({ name: e.target.value })}
          />
        </StatCard>
      </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
      <h3>{localize(config.common.details)}</h3>
      <div class="stat-grid single-column">
        <StatCard {...weaponMode} />
      </div>

      <div class="stat-grid two-column">
        {#each weaponEntries as entry}
          <StatCard {...entry} />
        {/each}
      </div>
    </ItemSheetComponent>

    <Commodity {item} {config} gridCss="two-column" />
    <Portability {item} {config} gridCss="two-column" />
    <JournalViewer {item} {config} />
  </div>
</div>
