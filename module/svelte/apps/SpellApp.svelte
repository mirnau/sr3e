<script lang="ts">
   import { localize, openFilePicker, kvOptions } from "@services/utilities.js";
   // import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import DerivedAttributeCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import { onMount, onDestroy } from "svelte";
   import { StoreManager } from "../svelteHelpers/StoreManager.svelte";

   let { item, config } = $props();
   let itemStoreManager = StoreManager.Subscribe(item);
   onDestroy(() => StoreManager.Unsubscribe(item));

   let spellType = itemStoreManager.GetRWStore("type");
   let spellDurationType = itemStoreManager.GetRWStore("duration.type");

   let isSustained = $state(false);

   // INFO: Getting truth from config
   let spellTypeDropdown = kvOptions(config.dropdown.spelltype);
   let spellDurationDropdown = kvOptions(config.dropdown.spellduration);

   function updateType(type) {
      $spellType = type;
      item.update({ "system.type": type });
   }

   function updateDuration(duration) {
      $spellDurationType = duration;
      item.update({ "system.duration.type": duration });
   }

   $effect(() => {

      //The config object is not returned, the value is, which makes it always fail.
      console.log("!!!!!!!!!!!!!!!!!!!!");

      let selection = localize(config.dropdown.spellduration.sustained);

      console.log(selection, "&", $spellDurationType);

      isSustained = $spellDurationType === selection;
   });

   const rounds = $derived({
      item,
      key: "rounds",
      label: localize(config.time.rounds),
      value: item.system.duration.rounds,
      path: "system.duration",
      type: "number",
   });
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image src={item.img} title={item.name} />
      <div class="stat-grid single-column">
         <DerivedAttributeCard>
            <div class="stat-card-background"></div>
            <input
               class="large"
               name="name"
               type="text"
               value={item.name}
               onchange={(e) => item.update({ name: e.target.value })}
            />
         </DerivedAttributeCard>
      </div>
   </ItemSheetComponent>
   <ItemSheetComponent>
      <DerivedAttributeCard>
         <select type={$spellType} onchange={(e) => updateType(e.target.value)}>
            {#each spellTypeDropdown as option}
               <option value={option.value}>{option.label}</option>
            {/each}
         </select>
      </DerivedAttributeCard>
      <DerivedAttributeCard>
         <select
            duration={spellDurationType}
            onchange={(e) => updateDuration(e.target.value)}
         >
            {#each spellDurationDropdown as option}
               <option value={option.value}>{option.label}</option>
            {/each}
         </select>
      </DerivedAttributeCard>
      {#if isSustained}
         <StatCard {...rounds} />
      {/if}
   </ItemSheetComponent>
</ItemSheetWrapper>
