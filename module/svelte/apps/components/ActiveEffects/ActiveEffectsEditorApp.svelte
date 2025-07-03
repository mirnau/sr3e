<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";

   let { item, effect, config } = $props();

   function updateEffect(updates) {
      effect.update(updates);
   }

   function addChange() {
      const changes = [...(effect.changes || []), { key: "", mode: 1, value: "", priority: 0 }];
      updateEffect({ changes });
   }

   function updateChange(index, field, value) {
      const changes = [...effect.changes];
      changes[index][field] = value;
      updateEffect({ changes });
   }

   function deleteChange(index) {
      const changes = effect.changes.filter((_, i) => i !== index);
      updateEffect({ changes });
   }
</script>

<div class="effects-editor">
   <ItemSheetComponent>
      <div class="left-column">
         <h3>Effect Properties</h3>
         <div class="stat-card-grid single-column">
            <div class="stat-card">
               <h4>Name:</h4>
               <input type="text" value={effect.name} onchange={(e) => updateEffect({ name: e.target.value })} />
            </div>

            <div class="stat-card">
               <h4>Icon:</h4>
               <input type="text" value={effect.icon} onchange={(e) => updateEffect({ icon: e.target.value })} />
            </div>

            <div class="stat-card">
               <h4>Transfer:</h4>
               <input
                  type="checkbox"
                  checked={effect.transfer}
                  onchange={(e) => updateEffect({ transfer: e.target.checked })}
               />
            </div>

            <div class="stat-card">
               <h4>Disabled:</h4>
               <input
                  type="checkbox"
                  checked={effect.disabled}
                  onchange={(e) => updateEffect({ disabled: e.target.checked })}
               />
            </div>

            <div class="stat-card">
               <h4>Duration Type:</h4>
               <select value={effect.duration.type} onchange={(e) => updateEffect({ "duration.type": e.target.value })}>
                  <option value="none">None</option>
                  <option value="turns">Turns</option>
                  <option value="seconds">Seconds</option>
               </select>
            </div>

            <div class="stat-card">
               <h4>Duration Value:</h4>
               <input
                  type="number"
                  value={effect.duration.value}
                  onchange={(e) => updateEffect({ "duration.value": parseInt(e.target.value) })}
               />
            </div>

            <div class="stat-card">
               <h4>Duration h4:</h4>
               <input
                  type="text"
                  value={effect.duration.h4}
                  onchange={(e) => updateEffect({ "duration.h4": e.target.value })}
               />
            </div>
         </div>
      </div>
   </ItemSheetComponent>
   <ItemSheetComponent>
      <div class="right-column">
         <div class="table-header">
            <h3>Changes</h3>
            <button onclick={addChange}>➕ Add Change</button>
         </div>

         <table class="effect-table">
            <thead>
               <tr>
                  <th>Attribute Key</th>
                  <th>Change Mode</th>
                  <th>Effect Value</th>
                  <th>Priority</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               {#each effect.changes || [] as change, i}
                  <tr>
                     <td>
                        <input
                           type="text"
                           value={change.key}
                           onchange={(e) => updateChange(i, "key", e.target.value)}
                        />
                     </td>
                     <td>
                        <select value={change.mode} onchange={(e) => updateChange(i, "mode", parseInt(e.target.value))}>
                           {#each Object.entries(CONST.ACTIVE_EFFECT_MODES) as [h4, val]}
                              <option value={val}>{h4}</option>
                           {/each}
                        </select>
                     </td>
                     <td>
                        <input
                           type="text"
                           value={change.value}
                           onchange={(e) => updateChange(i, "value", e.target.value)}
                        />
                     </td>
                     <td>
                        <input
                           type="number"
                           value={change.priority}
                           onchange={(e) => updateChange(i, "priority", parseInt(e.target.value))}
                        />
                     </td>
                     <td>
                        <button onclick={() => deleteChange(i)}>🗑</button>
                     </td>
                  </tr>
               {:else}
                  <tr>
                     <td colspan="5" class="empty-row">No changes defined</td>
                  </tr>
               {/each}
            </tbody>
         </table>
      </div></ItemSheetComponent
   >
</div>
