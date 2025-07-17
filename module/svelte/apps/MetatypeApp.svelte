<script>
   import { localize, openFilePicker } from "../../services/utilities.js";
   import JournalViewer from "./components/JournalViewer.svelte";
   import StatCard from "./components/StatCard.svelte";
   import Image from "./components/basic/Image.svelte";
   import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";
   import ActiveEffectsViewer from "./components/ActiveEffects/ActiveEffectsViewer.svelte";

   let { item = {}, config = {} } = $props();

   const system = $state(item.system);

   const attributes = config.attributes;
   const common = config.common;
   const karmaConfig = config.karma;
   const traits = config.traits;
   let layoutMode = $state("double");

   const agerange = $derived([
      {
         item,
         key: "min",
         label: localize(common.min),
         value: system.agerange.min,
         path: "system.agerange",
         type: "number",
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.agerange.average,
         path: "system.agerange",
         type: "number",
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.agerange.max,
         path: "system.agerange",
         type: "number",
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
         type: "number",
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.physical.height.average,
         path: "system.physical.height",
         type: "number",
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.physical.height.max,
         path: "system.physical.height",
         type: "number",
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
         type: "number",
         options: [],
      },
      {
         item,
         key: "average",
         label: localize(common.average),
         value: system.physical.weight.average,
         path: "system.physical.weight",
         type: "number",
         options: [],
      },
      {
         item,
         key: "max",
         label: localize(common.max),
         value: system.physical.weight.max,
         path: "system.physical.weight",
         type: "number",
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
         type: "number",
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
         type: "number",
         options: [],
      },
      {
         item,
         key: "quickness",
         label: localize(attributes.quickness),
         value: system.attributeLimits.quickness,
         path: "system.attributeLimits",
         type: "number",
         options: [],
      },
      {
         item,
         key: "body",
         label: localize(attributes.body),
         value: system.attributeLimits.body,
         path: "system.attributeLimits",
         type: "number",
         options: [],
      },
      {
         item,
         key: "charisma",
         label: localize(attributes.charisma),
         value: system.attributeLimits.charisma,
         path: "system.attributeLimits",
         type: "number",
         options: [],
      },
      {
         item,
         key: "intelligence",
         label: localize(attributes.intelligence),
         value: system.attributeLimits.intelligence,
         path: "system.attributeLimits",
         type: "number",
         options: [],
      },
      {
         item,
         key: "willpower",
         label: localize(attributes.willpower),
         value: system.attributeLimits.willpower,
         path: "system.attributeLimits",
         type: "number",
         options: [],
      },
   ]);

   const priorityEntry = $derived({
      item,
      key: "priority",
      label: "Select Priority",
      value: system.priority,
      path: "system",
      type: "select",
      options: ["C", "D", "E"],
   });
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
      <!-- Name and Priority -->
      <ItemSheetComponent>
         <Image entity={item} />
         <input
            class="large"
            name="name"
            type="text"
            bind:value={item.name}
            onchange={(e) => item.update({ name: e.target.value })}
         />
         <StatCard {...priorityEntry} />
      </ItemSheetComponent>

      <!-- Age Range -->
      {#if agerange}
         <ItemSheetComponent>
            <h3 class="item">{localize(traits.agerange)}</h3>
            <div class="stat-grid">
               {#each agerange as entry}
                  <StatCard {...entry} />
               {/each}
            </div>
         </ItemSheetComponent>
      {/if}

      <!-- Height -->
      {#if height}
         <ItemSheetComponent>
            <h3 class="item">{localize(traits.height)}</h3>
            <div class="stat-grid">
               {#each height as entry}
                  <StatCard {...entry} />
               {/each}
            </div>
         </ItemSheetComponent>
      {/if}

      <!-- Weight -->
      {#if weight}
         <ItemSheetComponent>
            <h3 class="item">{localize(traits.weight)}</h3>
            <div class="stat-grid">
               {#each weight as entry}
                  <StatCard {...entry} />
               {/each}
            </div>
         </ItemSheetComponent>
      {/if}

      <!-- Attribute Limits -->
      <ItemSheetComponent>
         <h3 class="item">{localize(attributes.limits)}</h3>
         <div class="stat-grid">
            {#each attributeLimits as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>

      <!-- Karma -->
      <ItemSheetComponent>
         <h3 class="item">{localize(config.karma.karma)}</h3>
         <div class="stat-grid single-column">
            {#each karma as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
      <ItemSheetComponent>
         <ActiveEffectsViewer document={item} {config} />
      </ItemSheetComponent>
      <!-- Journal Viewer -->
      <JournalViewer document={item} {config} />
   </div>
</div>
