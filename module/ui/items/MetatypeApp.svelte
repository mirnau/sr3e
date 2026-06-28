<script lang="ts">
   import { untrack } from "svelte";
import { localize } from "../../services/utilities";
   import LabeledDropdown from "./LabeledDropdown.svelte";
   import LabeledNumberInput from "./LabeledNumberInput.svelte";
   import Image from "../common-components/Image.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import JournalViewer from "../common-components/JournalViewer.svelte";
   import SR3EItem from "../../documents/SR3EItem";

   let { item: _item }: { item: SR3EItem } = $props();
   const item = untrack(() => _item);

   const system = item.system;

   const attributes = CONFIG.SR3E.ATTRIBUTES;
   const common = CONFIG.SR3E.COMMON;
   const karmaConfig = CONFIG.SR3E.KARMA;
   const traits = CONFIG.SR3E.METATYPE;

   const agerange = $derived([
      { key: "min",     label: localize(common.min),     value: system.agerange.min,     path: "system.agerange" },
      { key: "average", label: localize(common.average), value: system.agerange.average, path: "system.agerange" },
      { key: "max",     label: localize(common.max),     value: system.agerange.max,     path: "system.agerange" },
   ]);

   const height = $derived([
      { key: "min",     label: localize(common.min),     value: system.physical.height.min,     path: "system.physical.height" },
      { key: "average", label: localize(common.average), value: system.physical.height.average, path: "system.physical.height" },
      { key: "max",     label: localize(common.max),     value: system.physical.height.max,     path: "system.physical.height" },
   ]);

   const weight = $derived([
      { key: "min",     label: localize(common.min),     value: system.physical.weight.min,     path: "system.physical.weight" },
      { key: "average", label: localize(common.average), value: system.physical.weight.average, path: "system.physical.weight" },
      { key: "max",     label: localize(common.max),     value: system.physical.weight.max,     path: "system.physical.weight" },
   ]);

   const karma = $derived([
      { key: "factor", label: localize(karmaConfig.advancementratio), value: system.karma.factor, path: "system.karma" },
   ]);

   const movement = $derived([
      { key: "factor", label: localize(CONFIG.SR3E.MOVEMENT.runSpeedModifier), value: system.movement.factor, path: "system.movement" },
   ]);

   const attributeLimits = $derived([
      { key: "strength",     label: localize(attributes.strength),     value: system.attributeLimits.strength,     path: "system.attributeLimits" },
      { key: "quickness",    label: localize(attributes.quickness),    value: system.attributeLimits.quickness,    path: "system.attributeLimits" },
      { key: "body",         label: localize(attributes.body),         value: system.attributeLimits.body,         path: "system.attributeLimits" },
      { key: "charisma",     label: localize(attributes.charisma),     value: system.attributeLimits.charisma,     path: "system.attributeLimits" },
      { key: "intelligence", label: localize(attributes.intelligence), value: system.attributeLimits.intelligence, path: "system.attributeLimits" },
      { key: "willpower",    label: localize(attributes.willpower),    value: system.attributeLimits.willpower,    path: "system.attributeLimits" },
   ]);
</script>

<ItemSheetWrapper csslayout="double">
<ItemSheetComponent>
      <Image entity={item} />
      <div class="large-input-wrapper">
         <div class="large-input-background"></div>
         <input
            class="large"
            name="name"
            type="text"
            value={item.name}
            onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
         />
      </div>
      <LabeledDropdown {item} key="priority" label="Select Priority" value={system.priority} path="system" options={["C", "D", "E"].map((p) => ({ value: p, label: p }))} />
   </ItemSheetComponent>
{#if agerange}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.agerange)}</h3>
         <div class="stat-grid two-column">
            {#each agerange as entry}
               <LabeledNumberInput {item} {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
{#if height}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.height)}</h3>
         <div class="stat-grid two-column">
            {#each height as entry}
               <LabeledNumberInput {item} {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
{#if weight}
      <ItemSheetComponent>
         <h3 class="staticlayout">{localize(traits.weight)}</h3>
         <div class="stat-grid two-column">
            {#each weight as entry}
               <LabeledNumberInput {item} {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>
   {/if}
<ItemSheetComponent>
      <h3 class="staticlayout">{localize(attributes.limits)}</h3>
      <div class="stat-grid two-column">
         {#each attributeLimits as entry}
            <LabeledNumberInput {item} {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h3 class="staticlayout">Movement</h3>
      <div class="stat-grid single-column">
         {#each movement as entry}
            <LabeledNumberInput {item} {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>
<ItemSheetComponent>
      <h3 class="staticlayout">{localize(karmaConfig.karma)}</h3>
      <div class="stat-grid single-column">
         {#each karma as entry}
            <LabeledNumberInput {item} {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>
<JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
