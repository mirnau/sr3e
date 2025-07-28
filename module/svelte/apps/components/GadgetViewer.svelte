<script>
   import { localize } from "@services/utilities.js";
   import { onMount, onDestroy } from "svelte";
   import GadgetRow from "@sveltecomponent/ActiveEffects/GadgetRow.svelte";

   let { document, config, isSlim = false } = $props();

   let dropZone;
   let dragActive = $state(false);
   let dragHover = $state(false);
   let dropZoneClass = $state("drop-zone");

   let groupedAttachedGadgets = $state([]);
   let groupedTransferredGadgets = $state([]);
   let isViewerInstanceOfActor = document instanceof Actor;

   // Group effects by source item (origin ID)
   function groupByOrigin(effects, itemSourceMap = new Map()) {
      const groups = new Map();

      for (const effect of effects) {
         const origin = effect.flags?.sr3e?.gadget?.origin;
         if (!origin) continue;

         if (!groups.has(origin)) {
            const source = itemSourceMap.get?.(origin) ?? null;
            groups.set(origin, { origin, effects: [], source });
         }

         groups.get(origin).effects.push(effect);
      }

      return Array.from(groups.values());
   }

   function refreshEffects() {
      const ownEffects = document.effects.contents.filter((e) => e.flags?.sr3e?.gadget?.type === "gadget");
      groupedAttachedGadgets = groupByOrigin(ownEffects);

      if (document instanceof Actor) {
         const items = document.items.contents;
         const itemMap = new Map(items.map((i) => [i.id, i]));
         const transferred = items.flatMap((item) =>
            item.effects.contents.filter((e) => e.flags?.sr3e?.gadget?.type === "gadget")
         );
         groupedTransferredGadgets = groupByOrigin(transferred, itemMap);
      } else {
         groupedTransferredGadgets = [];
      }
   }

   onMount(() => {
      const handler = (actor) => {
         if (actor?.id !== document.id) return;
         refreshEffects();
      };

      Hooks.on("actorSystemRecalculated", handler);
      refreshEffects();

      onDestroy(() => {
         Hooks.off("actorSystemRecalculated", handler);
      });
   });

   $effect(refreshEffects);

   async function onHandleEffectTriggerUI() {
      Hooks.callAll("actorSystemRecalculated", document);
      refreshEffects();
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
      console.log("INCOMING", sourceItem);

      const commodity = sourceItem.system.commodity;
      const sourceItemType = sourceItem.system.type;

      const gadgetFlags = {
         name: sourceItem.name,
         img: sourceItem.img,
         isEnabled: true,
         type: "gadget",
         origin: sourceItem.id,
         gadgetType: sourceItemType,
         commodity,
      };

      let effectsToAdd = sourceItem.effects.contents.map((effect) => {
         const data = effect.toObject();
         return {
            ...data,
            _id: foundry.utils.randomID(),
            flags: {
               ...data.flags,
               sr3e: {
                  ...data.flags?.sr3e,
                  gadget: gadgetFlags,
               },
            },
         };
      });

      if (effectsToAdd.length === 0) {
         effectsToAdd = [
            {
               _id: foundry.utils.randomID(),
               name: gadgetFlags.name ?? "Unnamed Gadget",
               img: gadgetFlags.img ?? "icons/svg/mystery-man.svg",
               changes: [],
               duration: {},
               disabled: false,
               flags: {
                  sr3e: { gadget: gadgetFlags },
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
               <th>{localize(config.effects.disabled)}</th>
               <th>{localize(config.effects.actions)}</th>
            </tr>
         </thead>
         <tbody>
            {#each groupedAttachedGadgets as { origin, effects } (origin)}
               <GadgetRow {document} activeEffects={effects} {config} {onHandleEffectTriggerUI} />
            {/each}
            {#if isViewerInstanceOfActor}
               {#each groupedTransferredGadgets as { origin, effects } (origin)}
                  <GadgetRow
                     {document}
                     activeEffects={effects}
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
