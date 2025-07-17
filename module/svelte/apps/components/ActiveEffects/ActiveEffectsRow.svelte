<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../../services/utilities.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import ActiveEffectsEditor from "../../../../foundry/applications/ActiveEffectsEditor.js";

   let { document, activeEffect, config, isViewerInstanceOfActor = false, onHandleEffectTriggerUI } = $props();

   let storeManager = StoreManager.Subscribe(document);
   onDestroy(() => {
      StoreManager.Unsubscribe(document);
   });
   let nameStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:name`, activeEffect.name);
   let durationStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:duration`, activeEffect.duration);
   let disabledStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:disabled`, activeEffect.disabled);
   let canDelete = !isViewerInstanceOfActor;

   let duration = $state("");

   $effect(() => {
      duration = formatDuration($durationStore);
   });

   function formatDuration(duration) {
      if (!duration || duration.type === "none") return "Permanent";

      const value = duration[duration.type] ?? 0;

      if (duration.type === "seconds") {
         const minutes = Math.floor(value / 60);
         const hours = Math.floor(minutes / 60);
         const days = Math.floor(hours / 24);

         if (days) return `${days}d ${hours % 24}h ${minutes % 60}m`;
         if (hours) return `${hours}h ${minutes % 60}m`;
         if (minutes) return `${minutes}m ${value % 60}s`;
         return `${value}s`;
      }

      if (duration.type === "rounds") return `${value} rounds`;
      if (duration.type === "turns") return `${value} turns`;
      if (duration.type === "minutes") return `${value} min`;
      if (duration.type === "hours") return `${value} h`;
      if (duration.type === "days") return `${value} d`;

      return "Unknown";
   }

   function openEditor(activeEffect) {
      ActiveEffectsEditor.launch(document, activeEffect, config, onHandleEffectTriggerUI);
   }

   async function deleteEffect(effectId) {
      await document.deleteEmbeddedDocuments("ActiveEffect", [effectId], { render: false });
      await onHandleEffectTriggerUI();
   }
</script>

<tr>
   <td>
      <div class="cell-content">
         <img src={activeEffect.img} alt={$nameStore} />
      </div>
   </td>
   <td>
      <div class="cell-content">{$nameStore}</div>
   </td>
   <td>
      <div class="cell-content">{duration}</div>
   </td>
   <td>
      <div class="cell-content">{$disabledStore ? "Yes" : "No"}</div>
   </td>
   <td>
      <div class="cell-content">
         <div class="buttons-vertical-distribution square">
            <button
               aria-label={localize(config.sheet.delete)}
               class="fas fa-edit"
               onclick={() => openEditor(activeEffect)}
            ></button>
            <button
               aria-label={localize(config.sheet.delete)}
               onclick={() => deleteEffect(activeEffect.id)}
               class="fas fa-trash-can"
               disabled={!canDelete ||
                  (activeEffect.duration?.type === "permanent" && activeEffect.changes.length > 1)}
            ></button>
         </div>
      </div>
   </td>
</tr>
