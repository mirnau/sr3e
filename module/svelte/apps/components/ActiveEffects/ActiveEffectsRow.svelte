<script>
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import Switch from "@sveltecomponent/Switch.svelte";
   import { derived } from "svelte/store";

   let { effectData, config, onEdit, onDelete, canDelete } = $props();

   const { activeEffect, sourceDocument } = effectData;
   let enabled = $state(!activeEffect.disabled);

   let storeManager = StoreManager.Subscribe(activeEffect);
   onDestroy(() => {
      StoreManager.Unsubscribe(activeEffect);
   });

   let nameStore = storeManager.GetRWStore("name", true);
   let durationStore = storeManager.GetRWStore("duration", true);
   let disabledStore = storeManager.GetRWStore("disabled", true);

   let duration = $state("");

   $effect(() => {
      duration = formatDuration($durationStore);
   });

   $effect(() => {
      enabled = !activeEffect.disabled;
   });

   async function onToggleEnabled(event) {
      enabled = event.currentTarget.checked;

      const updates = {
         disabled: !enabled,
         "flags.sr3e.gadget.isEnabled": enabled,
      };

      await activeEffect.update(updates, { render: false });
   }

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

      const typeMap = {
         rounds: `${value} rounds`,
         turns: `${value} turns`,
         minutes: `${value} min`,
         hours: `${value} h`,
         days: `${value} d`,
      };

      return typeMap[duration.type] ?? "Unknown";
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
      <Switch checked={!$disabledStore} ariaLabel={localize(config.sheet.enabled)} onChange={onToggleEnabled} />
   </td>
   <td>
      <div class="cell-content">
         <div class="buttons-horizontal-distribution square">
            <button
               type="button"
               aria-label={localize(config.sheet.edit)}
               class="fas fa-edit"
               onclick={() => onEdit(effectData)}
            ></button>
            <button
               type="button"
               aria-label={localize(config.sheet.delete)}
               onclick={() => onDelete(effectData)}
               class="fas fa-trash-can"
               disabled={!canDelete(effectData)}
            ></button>
         </div>
      </div>
   </td>
</tr>
