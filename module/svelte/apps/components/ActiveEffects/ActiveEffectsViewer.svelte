<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ActiveEffectsEditor from "../../../../foundry/applications/ActiveEffectsEditor.js";
   import { localize } from "../../../../services/utilities.js";

   let { document, config } = $props();

   const effects = $derived(document.effects.contents);

   async function addEffect() {
      await document.createEmbeddedDocuments("ActiveEffect", [
         {
            name: "New Effect",
            transfer: true,
            disabled: false,
            changes: [],
         },
      ]);
   }

   async function deleteEffect(effectId) {
      await document.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
   }

   function openEditor(effect) {
      ActiveEffectsEditor.launch(document, effect, config);
   }
</script>

<div class="effects-viewer">
   <div class="effects-header">
      <button class="fas fa-plus" type="button" onclick={addEffect}></button>
   </div>

   <table>
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
                  <div class="buttons-vertical-distribution square">
                     <button
                        aria-label={localize(config.sheet.delete)}
                        class="fas fa-edit"
                        onclick={() => openEditor(effect)}
                     ></button>
                     <button
                        aria-label={localize(config.sheet.delete)}
                        onclick={() => deleteEffect(effect.id)}
                        class="fas fa-trash-can"
                        disabled={effect.duration?.type === "permanent" && effect.changes.length > 1}
                     ></button>
                  </div>
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
