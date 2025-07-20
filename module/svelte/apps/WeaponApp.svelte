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
   let name = $state(item.name);
   const system = $state(item.system);

   const weaponMode = $derived({
      item,
      key: "mode",
      label: localize(config.weapon.mode),
      value: system.mode,
      path: "system",
      type: "select",
      options: Object.values(config.weaponMode).map(localize),
   });

   const ammoClassEntry = $derived({
      item,
      key: "ammunitionClass",
      label: localize(config.weapon.ammunitionClass),
      value: system.ammunitionClass,
      path: "system",
      type: "select",
      options: Object.values(config.ammunitionClass).map(localize),
   });

   const damageTypeEntry = $derived({
      item,
      key: "damageType",
      label: localize(config.weapon.damageType),
      value: system.damageType,
      path: "system",
      type: "select",
      options: Object.values(config.damageType).map(localize),
   });

   function attack() {
      console.log("Pew pew");
   }
   
   function reload() {
      console.log("Pew pew");
   }
   
   function newClip() {
      console.log("Pew pew");
   }

   const weaponEntries = [
      {
         item,
         key: "damage",
         label: localize(config.weapon.damage),
         value: system.damage,
         path: "system",
         type: "number",
      },
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
   ];
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
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
      </ItemSheetComponent>

      <ItemSheetComponent>
         <h3>{localize(config.common.details)}</h3>
         <div class="stat-grid single-column">
            <StatCard {...weaponMode} />
            <StatCard {...damageTypeEntry} />
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
