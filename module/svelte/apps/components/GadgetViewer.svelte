<script>
   import { localize } from "@services/utilities.js";
   import { onMount, onDestroy } from "svelte";
   import GadgetRow from "@sveltecomponent/ActiveEffects/GadgetRow.svelte";

   let { document, config, isSlim = false } = $props();

   let dropZone;
   let dragActive = $state(false);
   let dragHover = $state(false);
   let actorAttachedGadgetEffects = $state(document.effects.contents);
   let transferredGadgetEffects = $state([]);
   let isViewerInstanceOfActor = document instanceof Actor;
   let dropZoneClass = $state("drop-zone");

   onMount(() => {
      const handler = (actor) => {
         if (document?.id !== actor.id) return;
         actorAttachedGadgetEffects = [...document.effects.contents];
         transferredGadgetEffects =
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
      actorAttachedGadgetEffects = [...document.effects.contents];

      transferredGadgetEffects =
         document instanceof Actor
            ? document.items.contents.flatMap((item) =>
                 item.effects.contents.map((activeEffect) => ({ activeEffect, item }))
              )
            : [];
   });

   async function onHandleEffectTriggerUI() {
      Hooks.callAll("actorSystemRecalculated", document);
      actorAttachedGadgetEffects = [...document.effects.contents];
      transferredGadgetEffects = [...transferredGadgetEffects];
   }

   function handleDragStart(event) {
      dragActive = true;
      const data = { type: document.type, uuid: document.uuid };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
      event.dataTransfer.effectAllowed = "move";
   }

   function handleDragEnd() {
      dragActive = false;
      dragHover = false;
   }

   function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
   }

   function handleDragEnter(event) {
      event.preventDefault();
      dragHover = true;
   }

   function handleDragLeave(event) {
      if (!dropZone.contains(event.relatedTarget)) {
         dragHover = false;
      }
   }

   async function addEffect(sourceItem) {
      const commodity = sourceItem.system.commodity;
      const sourceItemType = sourceItem.system.type;

      let effectsToAdd = sourceItem.effects.contents.map((effect) => {
         const data = effect.toObject();
         return {
            ...data,
            _id: foundry.utils.randomID(),
            flags: {
               ...data.flags,
               sr3e: {
                  ...data.flags?.sr3e,
                  type: "gadget",
                  gadgetType: sourceItemType,
                  source: "manual",
                  commodity,
               },
            },
         };
      });

      if (effectsToAdd.length === 0) {
         effectsToAdd = [
            {
               _id: foundry.utils.randomID(),
               name: sourceItem.name ?? "Unnamed Gadget",
               icon: sourceItem.img ?? "icons/svg/mystery-man.svg",
               changes: [],
               duration: {},
               disabled: false,
               flags: {
                  sr3e: {
                     type: "gadget",
                     gadgetType: sourceItemType,
                     source: "manual",
                     commodity,
                  },
               },
            },
         ];
      }

      await document.createEmbeddedDocuments("ActiveEffect", effectsToAdd, { render: false });
      await onHandleEffectTriggerUI();
   }

   async function handleDrop(event) {
      event.preventDefault();
      dragHover = false;

      const raw = event.dataTransfer.getData("text/plain");
      if (!raw) return;

      const droppedData = JSON.parse(raw);
      const droppedItem = await fromUuid(droppedData.uuid);

      if (!(droppedItem instanceof Item)) return;
      if (droppedItem.type !== "gadget") return;
      if (droppedItem.system.type === "") {
         ui.notifications.warn(localize(config.notifications.warnnogadgettypeselected));
         return;
      }

      await addEffect(droppedItem);
      await document.prepareData();
   }

   $effect(() => {
      dropZoneClass = `drop-zone ${dragActive ? "drag-active" : ""} ${dragHover ? "drag-hover" : ""}`;
   });
</script>

<div
   bind:this={dropZone}
   role="region"
   aria-label="Gadget drop target"
   class={dropZoneClass}
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}
   ondragover={handleDragOver}
   ondragenter={handleDragEnter}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}
>
   <div class="content">
      <table class:slim={isSlim}>
         <thead>
            <tr>
               <th></th>
               <th>{localize(config.effects.name)}</th>
               <th>{localize(config.effects.durationType)}</th>
               <th>{localize(config.effects.disabled)}</th>
               <th>{localize(config.effects.actions)}</th>
            </tr>
         </thead>
         <tbody>
            {#each actorAttachedGadgetEffects.filter((e) => e.flags?.sr3e?.type === "gadget") as activeEffect (activeEffect.id)}
               <GadgetRow {document} {activeEffect} {config} {onHandleEffectTriggerUI} />
            {/each}
            {#if isViewerInstanceOfActor}
               {#each transferredGadgetEffects.filter(({ activeEffect }) => activeEffect.flags?.sr3e?.type === "gadget") as { activeEffect, item } (activeEffect.id)}
                  <GadgetRow
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

   {#if dragHover}
      <div class="drag-overlay">
         <div class="drop-indicator">Drop here</div>
      </div>
   {/if}
</div>
