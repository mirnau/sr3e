<script>
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import { localize } from "../../../../services/utilities.js";
   import ActiveEffectsRow from "./ActiveEffectsRow.svelte";
   import { onMount, onDestroy } from "svelte";

   let { document, config, isSlim = false } = $props();

   let actorAttachedEffects = $state(document.effects.contents);
   let transferredEffects = $state([]);
   let isViewerInstanceOfActor = document instanceof Actor;

   onMount(() => {
      const handler = (actor) => {
         if (document?.id !== actor.id) return;
         actorAttachedEffects = [...document.effects.contents];
         transferredEffects =
            document instanceof Actor
               ? document.items.contents.flatMap((item) =>
                    item.effects.contents.map((activeEffect) => ({ activeEffect, item }))
                 )
               : [];
      };

      Hooks.on("actorSystemRecalculated", handler);

      onDestroy(() => {
         Hooks.off("actorSystemRecalculated", handler);
      });
   });

   $effect(() => {
      actorAttachedEffects = [...document.effects.contents];

      transferredEffects =
         document instanceof Actor
            ? document.items.contents.flatMap((item) =>
                 item.effects.contents.map((activeEffect) => ({ activeEffect, item }))
              )
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
      Hooks.callAll("actorSystemRecalculated", document);
      actorAttachedEffects = [...document.effects.contents];
      transferredEffects = [...transferredEffects];
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
            <th><div class="cell-content">{localize(config.effects.disabled)}</div></th>
            <th><div class="cell-content">{localize(config.effects.actions)}</div></th>
         </tr>
      </thead>
      <tbody>
         {#each actorAttachedEffects as activeEffect (activeEffect.id)}
            <ActiveEffectsRow {document} {activeEffect} {config} {onHandleEffectTriggerUI} />
         {/each}
         {#if document instanceof Actor}
            {#each transferredEffects as { activeEffect, item } (activeEffect.id)}
               <ActiveEffectsRow
                  document={item}
                  {activeEffect}
                  {config}
                  {isViewerInstanceOfActor}
                  {onHandleEffectTriggerUI}
               />
            {/each}
         {/if}
      </tbody>
   </table>
</div>
