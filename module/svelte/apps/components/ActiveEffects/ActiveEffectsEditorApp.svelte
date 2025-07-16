<script>
   import Image from "../basic/Image.svelte";
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ComboSearch from "../basic/ComboSearch.svelte";
   import { flags } from "../../../../services/commonConsts.js";
   import { localize } from "../../../../services/utilities.js";

   let { item, effectsObject, config, updateEffectsState } = $props();

   let name = $state(effectsObject.name);
   let disabled = $state(effectsObject.disabled);
   let duration = $state({ ...effectsObject.duration });
   let sourceType = $state(effectsObject.transfer ? "character" : "item");
   let changes = $state([...effectsObject.changes]);
   let propertyOptions = $state([]);

   const allowedPatterns = ["system.attributes", "system.physical"];

   $effect(() => {
      const transfer = sourceType !== "item";
      let rawPaths = [];

      if (transfer) {
         const actor = game.actors.find((a) => a.type === sourceType);
         if (actor) {
            rawPaths = Object.keys(foundry.utils.flattenObject({ system: actor.toObject().system }));
         }
      } else {
         rawPaths = Object.keys(foundry.utils.flattenObject({ system: item.toObject().system }));
      }

      propertyOptions = rawPaths
         .filter((path) => allowedPatterns.some((p) => path.startsWith(p)) && path.endsWith(".mod"))
         .map((path) => ({ value: path, label: path }));
   });

   async function commitChanges() {
      await effectsObject.update(
         {
            name,
            disabled,
            duration: { ...duration },
            changes: [...changes],
         },
         { render: false }
      );

      updateEffectsState?.();
   }

   function addChange() {
      changes = [...changes, { key: "", mode: 1, value: "", priority: 0 }];
      commitChanges();
   }

   function updateChange(index, field, value) {
      if (field === "key" && value && typeof value === "object" && "value" in value) {
         value = value.value;
      }
      const updated = changes.map((c, i) => (i === index ? { ...c, [field]: value } : c));
      changes = updated;
      commitChanges();
   }

   function deleteChange(index) {
      changes.splice(index, 1);
      changes = [...changes];
      commitChanges();
   }
</script>

<div class="effects-editor">
   <ItemSheetComponent>
      <h3>{localize(config.effects.effectscomposer)}</h3>
      <div class="stat-grid single-column">
         <Image src={effectsObject.img} title={name} entity={effectsObject} />

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.name)}:</h4>
            <input type="text" bind:value={name} onblur={commitChanges} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Source Type:</h4>
            <select bind:value={sourceType}>
               <option value="item">Item</option>
               <option value="character">Character</option>
               <option value="vehicle" disabled>Vehicle (TODO)</option>
            </select>
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.disabled)}:</h4>
            <input type="checkbox" bind:checked={disabled} onchange={commitChanges} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.durationType)}:</h4>
            <select bind:value={duration.type} onchange={commitChanges}>
               <option value="none">{localize(config.effects.permanent)}</option>
               <option value="turns">{localize(config.time.turns)}</option>
               <option value="rounds">{localize(config.time.rounds)}</option>
               <option value="seconds">{localize(config.time.seconds)}</option>
               <option value="minutes">{localize(config.time.minutes)}</option>
               <option value="hours">{localize(config.time.hours)}</option>
               <option value="days">{localize(config.time.days)}</option>
            </select>
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.durationValue)}:</h4>
            <input type="number" bind:value={duration.value} onblur={commitChanges} />
         </div>
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h1>{localize(config.effects.changesHeader)}</h1>
      <button onclick={addChange}>{localize(config.effects.addChange)}</button>

      <div class="table-wrapper">
         <table>
            <thead>
               <tr>
                  <th>{localize(config.effects.attributeKey)}</th>
                  <th>{localize(config.effects.changeMode)}</th>
                  <th>{localize(config.effects.value)}</th>
                  <th>{localize(config.effects.priority)}</th>
                  <th>{localize(config.effects.actions)}</th>
               </tr>
            </thead>
            <tbody>
               {#each changes as change, i}
                  <tr>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <ComboSearch
                              options={propertyOptions}
                              placeholder={localize(config.effects.selectProperty)}
                              nomatchplaceholder={localize(config.effects.noMatch)}
                              bind:value={change.key}
                              onselect={(e) => updateChange(i, "key", e.detail)}
                              css="table"
                           />
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <select
                              value={change.mode}
                              onchange={(e) => updateChange(i, "mode", parseInt(e.target.value))}
                           >
                              {#each Object.entries(CONST.ACTIVE_EFFECT_MODES) as [label, val]}
                                 <option value={val}>{label}</option>
                              {/each}
                           </select>
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <input
                              type="text"
                              value={change.value}
                              oninput={(e) => updateChange(i, "value", e.target.value)}
                           />
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <input
                              type="number"
                              value={change.priority}
                              oninput={(e) => updateChange(i, "priority", +e.target.value)}
                           />
                        </div>
                     </td>
                     <td>
                        <button onclick={() => deleteChange(i)}>🗑</button>
                     </td>
                  </tr>
               {/each}
            </tbody>
         </table>
      </div>
   </ItemSheetComponent>
</div>