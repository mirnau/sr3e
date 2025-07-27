<script>
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import GadgetEditorSheet from "@sheets/GadgetEditorSheet.js";
   import Switch from "@sveltecomponent/Switch.svelte";

   let { document, effects = [], config, onHandleEffectTriggerUI } = $props();

   const primary = effects[0];

   const storeManager = StoreManager.Subscribe(primary);
   onDestroy(() => StoreManager.Unsubscribe(primary));

   const nameStore = storeManager.GetFlagStore("gadget.name");
   const disabledStore = storeManager.GetFlagStore("gadget.isEnabled");

   async function deleteEffectGroup() {
      const ids = effects.map((e) => e.id);
      await document.deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });
      await onHandleEffectTriggerUI();
   }

   function updateAll(event) {
      const isEnabled = event.currentTarget.checked;

      //INFO: Updating the effect to correlate, through stores, to leverage reactivity
      for (const effect of effects) {
         let effectStoreManager = StoreManager.Subscribe(effect);

         let disabled = effectStoreManager.GetRWStore("disabled");
         disabled.set(!isEnabled);

         let enabled = effectStoreManager.GetFlagStore("gadtget.isEnabled");
         enabled.set(isEnabled);

         if (effect.id === primary.id) continue;
         StoreManager.Unsubscribe(effect);
      }

      onHandleEffectTriggerUI?.();
   }

   function openEditor() {
      new GadgetEditorSheet(document, effects, config).render(true);
   }
</script>

<tr>
   <td>
      <div class="cell-content">
         <img src={primary.img ?? "icons/svg/mystery-man.svg"} alt={$nameStore} />
      </div>
   </td>
   <td>
      <div class="cell-content">{$nameStore}</div>
   </td>
   <td>
      <div class="cell-content">
         <Switch bind:checked={$disabledStore} ariaLabel={localize(config.sheet.enabled)} onChange={updateAll} />
      </div>
   </td>
   <td>
      <div class="cell-content">
         <div class="buttons-vertical-distribution square">
            <button type="button" aria-label={localize(config.sheet.edit)} class="fas fa-edit" onclick={openEditor}
            ></button>

            <button
               type="button"
               aria-label={localize(config.sheet.delete)}
               class="fas fa-trash-can"
               onclick={deleteEffectGroup}
            ></button>
         </div>
      </div>
   </td>
</tr>
