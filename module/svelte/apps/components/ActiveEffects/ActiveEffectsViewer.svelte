
<script>
   import { localize } from "@services/utilities.js";
   import ActiveEffectsRow from "./ActiveEffectsRow.svelte";
   import { onMount, onDestroy } from "svelte";

   let { document, config, isSlim = false } = $props();

   let actorAttachedEffects = $state(document.effects.contents);
   let transferredEffects = $state([]);
   let isViewerInstanceOfActor = document instanceof Actor;

   onMount(() => {
      const handler = (actor) => {
         if (document?.id !== actor.id) return;
         refreshEffects();
      };

      Hooks.on("actorSystemRecalculated", handler);

      onDestroy(() => {
         Hooks.off("actorSystemRecalculated", handler);
      });
   });

   $effect(() => {
      refreshEffects();
   });

   function refreshEffects() {
      actorAttachedEffects = [...document.effects.contents];
      
      transferredEffects = document instanceof Actor
         ? document.items.contents.flatMap((item) =>
              item.effects.contents.map((activeEffect) => ({ 
                 activeEffect, 
                 sourceDocument: item,
                 canDelete: false 
              }))
           )
         : [];
   }

   async function addEffect() {
      await document.createEmbeddedDocuments(
         "ActiveEffect",
         [{
            name: "New Effect",
            icon: "systems/sr3e/textures/ai/icons/activeeffects.png",
            origin: document.uuid,
            disabled: false,
            transfer: true,
            duration: {
               startTime: game.time.worldTime,
               type: "none",
               value: 0,
            },
            changes: [],
            flags: {
               sr3e: {
                  source: "manual",
               },
            },
         }],
         { render: false }
      );
      await triggerRefresh();
   }

   async function editEffect(effectData) {
      const { activeEffect, sourceDocument } = effectData;
      const ActiveEffectsEditor = await import("../../../../foundry/applications/ActiveEffectsEditor.js");
      ActiveEffectsEditor.default.launch(sourceDocument, activeEffect, config, triggerRefresh);
   }

   async function deleteEffect(effectData) {
      const { activeEffect, sourceDocument } = effectData;
      await sourceDocument.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id], { render: false });
      await triggerRefresh();
   }

   async function triggerRefresh() {
      Hooks.callAll("actorSystemRecalculated", document);
      refreshEffects();
   }

   function canDeleteEffect(effectData) {
      const { activeEffect, canDelete } = effectData;
      return canDelete && !(activeEffect.duration?.type === "permanent" && activeEffect.changes.length > 1);
   }
</script>

<div class="effects-viewer">
   <div class="effects-header"></div>

   <table class:slim={isSlim}>
      <thead>
         <tr>
            <th><button class="fas fa-plus" type="button" onclick={addEffect}></button></th>
            <th><div class="cell-content">{localize(config.effects.name)}</div></th>
            <th><div class="cell-content">{localize(config.effects.durationType)}</div></th>
            <th><div class="cell-content">{localize(config.effects.enabled)}</div></th>
            <th><div class="cell-content">{localize(config.effects.actions)}</div></th>
         </tr>
      </thead>
      <tbody>
         {#each actorAttachedEffects.filter((e) => !e.flags?.sr3e?.type) as activeEffect (activeEffect.id)}
            <ActiveEffectsRow 
               effectData={{ 
                  activeEffect, 
                  sourceDocument: document, 
                  canDelete: true 
               }}
               {config}
               onEdit={editEffect}
               onDelete={deleteEffect}
               canDelete={canDeleteEffect}
            />
         {/each}
         {#if isViewerInstanceOfActor}
            {#each transferredEffects.filter(({ activeEffect }) => !activeEffect.flags?.sr3e?.type) as effectData (effectData.activeEffect.id)}
               <ActiveEffectsRow 
                  {effectData}
                  {config}
                  onEdit={editEffect}
                  onDelete={deleteEffect}
                  canDelete={canDeleteEffect}
               />
            {/each}
         {/if}
      </tbody>
   </table>
</div>