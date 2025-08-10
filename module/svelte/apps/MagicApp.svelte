<script>
   import { localize, kvOptions } from "@services/utilities.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";

   let { item = {}, config = {} } = $props();

   const system = $state(item.system);
   const awakened = $state(system.awakened);
   const magicianData = $state(system.magicianData);
   const adeptData = $state(awakened.adeptData);

   const archetypeOptions = kvOptions(config.archetypes);
   const magicianTypeOptions = kvOptions(config.magicianTypes);
   const aspectsOptions = kvOptions(config.aspects);
   const resistanceAttributeOptions = kvOptions(config.resistanceAttributes);
   const traditionOptions = kvOptions(config.traditions);

   const awakenedState = $state({ ...system.awakened });
   const magicianDataState = $state({ ...system.magicianData });

   const isMagician = $derived(awakenedState.archetype === "magician");
   const isAdept = $derived(awakenedState.archetype === "adept");
   const isAspected = $derived(magicianDataState.magicianType === "aspectedmage");

   const archetype = $derived({
      item,
      key: "archetype",
      label: localize(config.magic.archetype),
      value: awakenedState.archetype,
      path: "system.awakened",
      type: "select",
      options: archetypeOptions,
   });

   const priority = $derived({
      item,
      key: "priority",
      label: localize(config.magic.priority),
      value: awakenedState.priority,
      path: "system.awakened",
      type: "select",
      options: ["A", "B"].map((p) => ({ value: p, label: p })),
   });

   const magicianType = $derived({
      item,
      key: "magicianType",
      label: localize(config.magic.magicianType),
      value: magicianDataState.magicianType,
      path: "system.magicianData",
      type: "select",
      options: magicianTypeOptions,
   });

   const aspect = $derived({
      item,
      key: "aspect",
      label: localize(config.magic.aspect),
      value: magicianDataState.aspect,
      path: "system.magicianData",
      type: "select",
      options: aspectsOptions,
   });

   const magicianFields = $derived([
      {
         item,
         key: "tradition",
         label: localize(config.magic.tradition),
         value: magicianDataState.tradition,
         path: "system.magicianData",
         type: "select",
         options: traditionOptions,
      },
      {
         item,
         key: "drainResistanceAttribute",
         label: localize(config.magic.drainResistanceAttribute),
         value: magicianDataState.drainResistanceAttribute,
         path: "system.magicianData",
         type: "select",
         options: resistanceAttributeOptions,
      },
      {
         item,
         key: "canAstrallyProject",
         label: localize(config.magic.canAstrallyProject),
         value: magicianDataState.canAstrallyProject,
         path: "system.magicianData",
         type: "checkbox",
         options: [],
      },
      {
         item,
         key: "totem",
         label: localize(config.magic.totem),
         value: magicianDataState.totem ?? localize(config.magic.shamannote),
         path: "system.magicianData",
         type: "text",
         options: [],
      },
   ]);

   const adeptFields = $derived([]);

   function setArchetype(v) {
      awakenedState.archetype = v;
   }
   function setPriority(v) {
      awakenedState.priority = v;
   }
   function setMagicianType(v) {
      magicianDataState.magicianType = v;
   }
   function setAspect(v) {
      magicianDataState.aspect = v;
   }
   function setTradition(v) {
      magicianDataState.tradition = v;
   }
   function setDrainAttr(v) {
      magicianDataState.drainResistanceAttribute = v;
   }
   function setAstral(v) {
      magicianDataState.canAstrallyProject = v;
   }
   function setTotem(v) {
      magicianDataState.totem = v;
   }
</script>

<ItemSheetWrapper csslayout={"double"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <StatCard>
            <input bind:value={item.name} onchange={(e) => item.update({ name: e.target.value })} />
         </StatCard>
         <StatCard {...archetype} onUpdate={setArchetype} />
         <StatCard {...priority} onUpdate={setPriority} />
      </div>
   </ItemSheetComponent>

   {#if isMagician}
      <ItemSheetComponent>
         <StatCard {...magicianType} onUpdate={setMagicianType} />
      </ItemSheetComponent>

      {#if isAspected}
         <ItemSheetComponent>
            <StatCard {...aspect} onUpdate={setAspect} />
         </ItemSheetComponent>
      {/if}

      {#each magicianFields as entry}
         <ItemSheetComponent>
            {#if entry.key === "tradition"}
               <StatCard {...entry} onUpdate={setTradition} />
            {:else if entry.key === "drainResistanceAttribute"}
               <StatCard {...entry} onUpdate={setDrainAttr} />
            {:else if entry.key === "canAstrallyProject"}
               <StatCard {...entry} onUpdate={setAstral} />
            {:else if entry.key === "totem"}
               <StatCard {...entry} onUpdate={setTotem} />
            {:else}
               <StatCard {...entry} />
            {/if}
         </ItemSheetComponent>
      {/each}
   {:else if isAdept}
      {#each adeptFields as entry}
         <ItemSheetComponent>
            <StatCard {...entry} />
         </ItemSheetComponent>
      {/each}
   {/if}

   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
