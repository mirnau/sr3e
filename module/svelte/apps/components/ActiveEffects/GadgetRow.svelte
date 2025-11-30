<script>
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import GadgetEditorSheet from "@sheets/GadgetEditorSheet.js";
   import Switch from "@sveltecomponent/Switch.svelte";

   let { document, activeEffects = [], config, onHandleEffectTriggerUI } = $props();

   const primary = activeEffects[0];
   if (!primary) throw new Error("No primary effect provided to GadgetRow");

   let sheetInstance = null;

   const storeManager = StoreManager.Subscribe(primary);
   onDestroy(() => StoreManager.Unsubscribe(primary));

   const nameStore = storeManager.GetFlagStore("gadget.name");
   const disabledStore = storeManager.GetFlagStore("gadget.isEnabled");

   async function deleteEffectGroup() {
      sheetInstance?.close();
      sheetInstance = null;
      const ids = activeEffects.map((e) => e.id);
      await document.deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });
      await onHandleEffectTriggerUI();
   }

   async function createEmbeddedGadget() {
      const actor = document.parent;

      // Clone and reparent effects
      const effectData = activeEffects.map((effect) => {
         const data = foundry.utils.deepClone(effect.toObject());
         delete data._id;
         return data;
      });

      // Create the gadget Item on the actor
      const [gadget] = await actor.createEmbeddedDocuments("Item", [
         {
            name: $nameStore ?? game.i18n.localize(config.sheet.newGadget),
            type: "gadget",
            img: primary.img,
            system: {}, // Empty unless schema demands otherwise
            effects: effectData,
         },
      ]);

      // Delete original effects from the weapon
      const ids = activeEffects.map((e) => e.id);
      await document.deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });

      await onHandleEffectTriggerUI?.();
   }

   function updateAll(event) {
      const isEnabled = event.currentTarget.checked;

      for (const effect of activeEffects) {
         const sm = StoreManager.Subscribe(effect);

         sm.GetRWStore("disabled", true).set(!isEnabled);
         sm.GetFlagStore("gadget.isEnabled").set(isEnabled);

         if (effect.id !== primary.id) StoreManager.Unsubscribe(effect);
      }

      onHandleEffectTriggerUI?.();
   }

   function openEditor() {
      sheetInstance = new GadgetEditorSheet(document, activeEffects, config);
      sheetInstance.render(true);
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
         <div class="buttons-horizontal-distribution square">
            <button type="button" aria-label={localize(config.sheet.edit)} class="fas fa-edit" onclick={openEditor}
            ></button>

            <button
               type="button"
               aria-label={localize(config.sheet.delete)}
               class="fas fa-trash-can"
               onclick={deleteEffectGroup}
            ></button>
            <button
               type="button"
               aria-label={localize(config.sheet.detatch)}
               class="fas fa-link-slash"
               onclick={createEmbeddedGadget}
               disabled={!document.isEmbedded || !(document.parent instanceof Actor)}
            ></button>
         </div>
      </div>
   </td>
</tr>
