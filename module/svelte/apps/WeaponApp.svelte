<script>
   import { localize, openFilePicker } from "@services/utilities.js";
   import { onMount } from "svelte";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import StatCard from "@sveltecomponent/StatCard.svelte";
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import GadgetViewer from "@sveltecomponent/GadgetViewer.svelte";

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
      <div>
         <h3>{localize(config.gadget.gadget)}</h3>
      </div>
      <GadgetViewer {item} {config} />
   </ItemSheetComponent>
   <ItemSheetComponent>
      <ActiveEffectsViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>
   <Commodity {item} {config} gridCss="two-column" />
   <Portability {item} {config} gridCss="two-column" />
   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
