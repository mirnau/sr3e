<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ActiveEffectsEditor from "../../../../foundry/applications/ActiveEffectsEditor.js"

   let { item, config } = $props();

   const effects = $derived(item.effects.contents);

   async function addEffect() {
      await item.createEmbeddedDocuments("ActiveEffect", [
         {
            name: "New Effect",
            transfer: true,
            disabled: false,
            changes: [
               {
                  key: "system.attributes.strength",
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: 0,
               },
            ],
         },
      ]);
   }

   async function deleteEffect(effectId) {
      await item.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
   }

   function openEditor(effect) {
      ActiveEffectsEditor.launch(item, effect, config);
   }
</script>

<ItemSheetComponent>
   <div class="effects-viewer">
      <div class="effects-header">
         <h3>Active Effects</h3>
         <button onclick={addEffect}>➕ Add Effect</button>
      </div>

      <table class="effects-table">
         <thead>
            <tr>
               <th>Name</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            {#each effects as effect (effect.id)}
               <tr>
                  <td>{effect.name}</td>
                  <td>
                     <button onclick={() => openEditor(effect)}>✏️ Edit</button>
                     <button onclick={() => deleteEffect(effect.id)}>🗑 Delete</button>
                  </td>
               </tr>
            {:else}
               <tr>
                  <td colspan="2" class="empty-row">No effects defined</td>
               </tr>
            {/each}
         </tbody>
      </table>
   </div>
</ItemSheetComponent>