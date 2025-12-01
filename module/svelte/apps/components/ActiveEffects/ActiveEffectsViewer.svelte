<script lang="ts">
   import { onMount, onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import ActiveEffectsRow from "./ActiveEffectsRow.svelte";

   let { document, config, isSlim = false } = $props();

   let actorAttachedEffects = $state([]);
   let transferredEffects = $state([]);
   const isViewerInstanceOfActor = document instanceof Actor;

   function refreshEffects() {
      actorAttachedEffects = document.effects.contents.filter((e) => !e.flags?.sr3e?.gadget);

      transferredEffects = isViewerInstanceOfActor
         ? document.items.contents.flatMap((item) =>
              item.effects.contents.map((activeEffect) => ({
                 activeEffect,
                 sourceDocument: item,
                 canDelete: false,
              }))
           )
         : [];
   }

   let cleanupHooks = [];

   onMount(() => {
      const relevant = (effect) =>
         effect?.parent?.id === document.id ||
         (isViewerInstanceOfActor && effect?.parent?.parent?.id === document.id);

      const update = () => refreshEffects();
      const hookTypes = ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"];

      for (const type of hookTypes) {
         const handler = (effect) => relevant(effect) && update();
         Hooks.on(type, handler);
         cleanupHooks.push(() => Hooks.off(type, handler));
      }

      refreshEffects();
   });

   onDestroy(() => {
      cleanupHooks.forEach((fn) => fn());
   });

   async function addEffect() {
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
            },
         ],
         { render: false }
      );
   }

   async function editEffect(effectData) {
      const { activeEffect, sourceDocument } = effectData;
      const ActiveEffectsEditor = await import("@applications/ActiveEffectsEditor.js");
      ActiveEffectsEditor.default.launch(sourceDocument, activeEffect, config);
   }

   async function deleteEffect(effectData) {
      const { activeEffect, sourceDocument } = effectData;
      await sourceDocument.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id], { render: false });
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
         {#each actorAttachedEffects as activeEffect (activeEffect.id)}
            <ActiveEffectsRow
               effectData={{
                  activeEffect,
                  sourceDocument: document,
                  canDelete: true,
               }}
               {config}
               onEdit={editEffect}
               onDelete={deleteEffect}
               canDelete={canDeleteEffect}
            />
         {/each}
         {#if isViewerInstanceOfActor}
            {#each transferredEffects as effectData (effectData.activeEffect.id)}
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
