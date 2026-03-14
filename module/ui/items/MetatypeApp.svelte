<script lang="ts">
   import { localize } from "../../services/utilities";
   import StatCard from "../common-components/StatCard.svelte";
   import Image from "../common-components/Image.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import JournalViewer from "../common-components/JournalViewer.svelte";
   import SR3EItem from "../../documents/SR3EItem";

   let { item }: { item: SR3EItem } = $props();

   const system = item.system;

   const attributes = CONFIG.SR3E.ATTRIBUTES;
   const common = CONFIG.SR3E.COMMON;
   const karmaConfig = CONFIG.SR3E.KARMA;
   const traits = CONFIG.SR3E.METATYPE;

   const agerange = $derived([
      {
         item,
         key: "min",
         label: localize(common.min),
         value: system.agerange.min,
         path: "system.agerange",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.agerange.average,
         path: "system.agerange",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.agerange.max,
         path: "system.agerange",
         type: "number" as const,
         options: [],
      },
   ]);

   const height = $derived([
      {
         item,
         key: "min",
         label: localize(common.min),
         value: system.physical.height.min,
         path: "system.physical.height",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.physical.height.average,
         path: "system.physical.height",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.physical.height.max,
         path: "system.physical.height",
         type: "number" as const,
         options: [],
      },
   ]);

   const weight = $derived([
      {
         item,
         key: "min",
         label: localize(common.min),
         value: system.physical.weight.min,
         path: "system.physical.weight",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.physical.weight.average,
         path: "system.physical.weight",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.physical.weight.max,
         path: "system.physical.weight",
         type: "number" as const,
         options: [],
      },
   ]);

   const karma = $derived([
      {
         item,
         key: "factor",
         label: localize(karmaConfig.advancementratio),
         value: system.karma.factor,
         path: "system.karma",
         type: "number" as const,
         options: [],
      },
   ]);

   const movement = $derived([
      {
         item,
         key: "factor",
         label: localize(CONFIG.SR3E.MOVEMENT.runSpeedModifier),
         value: system.movement.factor,
         path: "system.movement",
         type: "number" as const,
         options: [],
      },
   ]);

   const attributeLimits = $derived([
      {
         item,
         key: "strength",
         label: localize(attributes.strength),
         value: system.attributeLimits.strength,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "quickness",
         label: localize(attributes.quickness),
         value: system.attributeLimits.quickness,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "body",
         label: localize(attributes.body),
         value: system.attributeLimits.body,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "charisma",
         label: localize(attributes.charisma),
         value: system.attributeLimits.charisma,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "intelligence",
         label: localize(attributes.intelligence),
         value: system.attributeLimits.intelligence,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
      {
         item,
         key: "willpower",
         label: localize(attributes.willpower),
         value: system.attributeLimits.willpower,
         path: "system.attributeLimits",
         type: "number" as const,
         options: [],
      },
   ]);

   const priorityEntry = $derived({
      item,
      key: "priority",
      label: "Select Priority",
      value: system.priority,
      path: "system",
      type: "select" as const,
      options: ["C", "D", "E"].map((p) => ({ value: p, label: p })),
   });
</script>

<ItemSheetWrapper csslayout="double">
<ItemSheetComponent>
      <Image entity={item} />
      <input
         class="large"
         name="name"
         type="text"
         bind:value={item.name}
         onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
      />
      <StatCard {...priorityEntry} />
   </ItemSheetComponent>
{#if agerange}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.agerange)}</h3>
         <div class="stat-grid">
            {#each agerange as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
{#if height}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.height)}</h3>
         <div class="stat-grid">
            {#each height as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
{#if weight}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.weight)}</h3>
         <div class="stat-grid">
            {#each weight as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
<ItemSheetComponent>
      <h3 class="staticlayout">{localize(attributes.limits)}</h3>
      <div class="stat-grid">
         {#each attributeLimits as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h3 class="staticlayout">Movement</h3>
      <div class="stat-grid single-column">
         {#each movement as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>
<ItemSheetComponent>
      <h3 class="staticlayout">{localize(karmaConfig.karma)}</h3>
      <div class="stat-grid single-column">
         {#each karma as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>
<JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
