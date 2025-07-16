<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../../services/utilities.js";
   import StoreManager from "../../../svelteHelpers/StoreManager.svelte.js";

   let { document, effect, config, onHandleEffectTriggerUI } = $props();

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

   async function deleteEffect(effectId) {
      await document.deleteEmbeddedDocuments("ActiveEffect", [effectId], { render: false });
      await onHandleEffectTriggerUI();
   }
</script>

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
            <button aria-label={localize(config.sheet.delete)} class="fas fa-edit" onclick={() => openEditor(effect)}
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
