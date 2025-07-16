<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ActiveEffectsEditor from "../../../../foundry/applications/ActiveEffectsEditor.js";
   import { localize } from "../../../../services/utilities.js";
   import ActiveEffectsRow from "./ActiveEffectsRow.svelte";

   let { document, config } = $props();

   let actorAttachedEffects = $state(document.effects.contents);
   let transferredEffects = $state([]);

   $effect(() => {
      actorAttachedEffects = [...document.effects.contents];

      transferredEffects =
         document instanceof Actor
            ? document.items.contents.flatMap((item) => item.effects.contents.map((effect) => ({ effect, item })))
            : [];
   });

   async function addEffect(e) {
      event?.stopPropagation();
      event?.preventDefault();

      await document.createEmbeddedDocuments(
         "ActiveEffect",
         [
            {
               name: "New Effect",
               icon: "systems/sr3e/textures/ai/icons/activeeffects.png",
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
         ],
         { render: false }
      );
      await onHandleEffectTriggerUI();
   }

   async function onHandleEffectTriggerUI() {
      actorAttachedEffects = [...document.effects.contents];
      transferredEffects = [...transferredEffects];
   }

   function openEditor(effect) {
      ActiveEffectsEditor.launch(document, effect, config, updateEffectsState);
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
         {#each actorAttachedEffects as effect (effect.id)}
            <ActiveEffectsRow {document} {effect} {config} {onHandleEffectTriggerUI} />
         {/each}
         {#if document instanceof Actor}
            {#each transferredEffects as { effect, item } (effect.id)}
               <ActiveEffectsRow document={item} {effect} {config} {onHandleEffectTriggerUI} />
            {/each}
         {/if}
      </tbody>
   </table>
</div>
