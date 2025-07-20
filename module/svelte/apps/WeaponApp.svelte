<script>
   import { localize, openFilePicker } from "../../services/utilities.js";
   import { onMount } from "svelte";
   import JournalViewer from "./components/JournalViewer.svelte";
   import StatCard from "./components/StatCard.svelte";
   import Commodity from "./components/Commodity.svelte";
   import Portability from "./components/Portability.svelte";
   import Image from "./components/basic/Image.svelte";
   import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";
   import ActiveEffectsViewer from "./components/ActiveEffects/ActiveEffectsViewer.svelte";

   let layoutMode = $state("double");
   let { item = {}, config = {} } = $props();
   const system = $state(item.system);

   const weaponMode = $derived({
      item,
      key: "mode",
      label: localize(config.weapon.mode),
      value: system.mode,
      path: "system",
      type: "select",
      options: Object.values(config.weaponMode).map(localize)
   });

   const ammoClassEntry = $derived({
      item,
      key: "ammunitionClass",
      label: localize(config.weapon.ammunitionClass),
      value: system.ammunitionClass,
      path: "system",
      type: "select",
      options: Object.values(config.ammunitionClass).map(localize)
   });

   const damageEntry = $derived({
      item,
      key: "damage",
      label: localize(config.weapon.damageType),
      value: system.damage,
      path: "system",
      type: "select",
      options: Object.values(config.damageType).map(localize)
   });

   function attack() {
      //if fire weapon
      //if melee or blunt
   }

   function reload() {}

   function newClip() {}

   const weaponEntries = [
      {
         item,
         key: "range",
         label: localize(config.weapon.range),
         value: system.range,
         path: "system",
         type: "number",
      },
      {
         item,
         key: "recoilComp",
         label: localize(config.weapon.recoilCompensation),
         value: system.recoilComp,
         path: "system",
         type: "number",
      },
      {
         item,
         key: "currentClipId",
         label: localize(config.weapon.currentClip),
         value: system.currentClipId,
         path: "system",
         type: "text",
      },
   ];
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
      <ItemSheetComponent>
         <Image entity={item} />
         <div class="stat-grid single-column">
            <StatCard>
               <input
                  class="large"
                  name="name"
                  type="text"
                  bind:value={item.name}
                  onchange={(e) => item.update({ ["name"]: e.target.value })}
               />
            </StatCard>
         </div>
      </ItemSheetComponent>

      <ItemSheetComponent>
         <h3>{localize(config.common.details)}</h3>
         <div class="stat-grid single-column">
            <StatCard {...weaponMode} />
            <StatCard {...damageEntry} />
            <StatCard {...ammoClassEntry} />
         </div>

         <div class="stat-grid two-column">
            {#each weaponEntries as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
      <ItemSheetComponent>
         <ActiveEffectsViewer document={item} {config} isSlim={true} />
      </ItemSheetComponent>
      <Commodity {item} {config} gridCss="two-column" />
      <Portability {item} {config} gridCss="two-column" />
      <JournalViewer document={item} {config} />
   </div>
</div>
