<script>
   import Image from "../basic/Image.svelte";
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ComboSearch from "../basic/ComboSearch.svelte";
   import { flags } from "../../../../services/commonConsts.js";

   let { item, effect: effectsObject, config } = $props();
   let changes = $state([...effectsObject.changes]);

   let propertyOptions = $state([]);

   function flattenProperties(obj, prefix = "system") {
      return Object.entries(obj).flatMap(([key, value]) => {
         const path = `${prefix}.${key}`;
         return typeof value === "object" && value !== null && !Array.isArray(value)
            ? flattenProperties(value, path)
            : [path];
      });
   }

   //NOTE: Anything non moddable. Add more keys as needed
   const blockedKeys = ["system.journalId", "system.priority"];

   $effect(() => {
      propertyOptions = flattenProperties(item.system)
         .filter((path) => !blockedKeys.includes(path))
         .map((path) => ({
            value: path,
            label: path,
         }));
   });

   function commitChanges() {
      effectsObject.update({ changes });
   }

   function addChange() {
      changes = [...changes, { key: "", mode: 1, value: "", priority: 0 }];
      commitChanges();
   }

   function updateChange(index, field, value) {
      if (field === "key" && value && typeof value === "object" && "value" in value) {
         value = value.value;
      }
      const updated = changes.map((c, i) => {
         return i === index ? { ...c, [field]: value } : c;
      });
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
      <h3>Effect Properties</h3>
      <div class="stat-grid single-column">
         <Image src={effectsObject.img} title={effectsObject.name} entity={effectsObject} />

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Name:</h4>
            <input type="text" bind:value={effectsObject.name} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Transfer:</h4>
            <input type="checkbox" bind:checked={effectsObject.transfer} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Disabled:</h4>
            <input type="checkbox" bind:checked={effectsObject.disabled} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Duration Type:</h4>
            <select bind:value={effectsObject.duration.type}>
               <option value="none">None</option>
               <option value="turns">Turns</option>
               <option value="seconds">Seconds</option>
            </select>
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>Duration Value:</h4>
            <input type="number" bind:value={effectsObject.duration.value} />
         </div>
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h1>Changes</h1>
      <button onclick={addChange}>➕ Add Change</button>

      <div class="table-wrapper">
         <table>
            <thead>
               <tr>
                  <th>Attribute Key</th>
                  <th>Change Mode</th>
                  <th>Effect Value</th>
                  <th>Priority</th>
                  <th>Add to Pools</th>
                  <th>Actions</th>
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
                              placeholder="Select property"
                              nomatchplaceholder="No match"
                              bind:value={change.key}
                              on:select={(e) => updateChange(i, "key", e.detail)}
                              css={"table"}
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
                        <div class="stat-card centered">
                           <div class="stat-card-background"></div>
                           <input
                              type="checkbox"
                              oninput={(e) => effect.setFlag(flags.sr3e, flags.effect.contributes, e.target.checked)}
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
