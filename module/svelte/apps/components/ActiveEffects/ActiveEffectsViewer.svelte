<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ActiveEffectsEditor from "../../../../foundry/applications/ActiveEffectsEditor.js";
   import { localize } from "../../../../services/utilities.js";

   let { document, config } = $props();

   const effects = $derived(document.effects.contents);

   function formatDuration(duration) {
      console.log();

      if (!duration || duration.type === "none") return "Permanent";

      const { seconds, rounds, turns, combat } = duration;

      if (seconds) {
         const minutes = Math.floor(seconds / 60);
         const hours = Math.floor(minutes / 60);
         const days = Math.floor(hours / 24);

         if (days) return `${days}d ${hours % 24}h ${minutes % 60}m`;
         if (hours) return `${hours}h ${minutes % 60}m`;
         if (minutes) return `${minutes}m ${seconds % 60}s`;
         return `${seconds}s`;
      }

      if (rounds) return `${rounds} rounds`;
      if (turns) return `${turns} turns`;

      return "Unknown";
   }

   async function addEffect() {
      await document.createEmbeddedDocuments("ActiveEffect", [
         {
            name: "New Effect",
            icon: "systems/sr3e/icons/activeeffects.webp", // Consider using your system namespace
            origin: document.uuid,
            disabled: false,
            transfer: true,

            duration: {
               startTime: game.time.worldTime, // use worldTime, not seconds, to align with system
               type: "none", // default for permanent
               value: 0,
            },

            changes: [],

            flags: {
               sr3e: {
                  source: "manual",
                  // Any other default flags useful for tracking
               },
            },
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
            <th><div class="cell-content"></div></th>
            <th><div class="cell-content">Name</div></th>
            <th><div class="cell-content">Duration</div></th>
            <th><div class="cell-content">Actions</div></th>
         </tr>
      </thead>
      <tbody>
         {#each effects as effect (effect.id)}
            <tr>
               <td>
                  <div class="cell-content">
                     <img src={effect.img} alt={effect.name} />
                  </div>
               </td>
               <td>
                  <div class="cell-content">{effect.name}</div>
               </td>
               <td>
                  <div class="cell-content">{formatDuration(effect.duration)}</div>
               </td>
               <td>
                  <div class="cell-content">
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
                  </div>
               </td>
            </tr>
         {/each}
      </tbody>
   </table>
</div>
