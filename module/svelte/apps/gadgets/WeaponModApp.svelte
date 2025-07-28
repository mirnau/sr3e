<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";

   import CommodityModel from "@models/item/components/Commodity.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import ActiveEffectsRow from "@sveltecomponent/ActiveEffects/ActiveEffectsRow.svelte";

   let { document, activeEffects = [], config } = $props();

   let effectsList = $state([]);
   const primary = activeEffects[0];
   if (!primary) throw new Error("No primary effect passed to gadget editor");

   const storeManager = StoreManager.Subscribe(primary);
   onDestroy(() => StoreManager.Unsubscribe(primary));

   const commodityStore = storeManager.GetFlagStore("commodity");
   const commodity = new CommodityModel($commodityStore);

   let days = $state(commodity.days);
   let cost = $state(commodity.cost);
   let streetIndex = $state(commodity.streetIndex);
   let legalityStatus = $state(commodity.legality.status);
   let legalityPermit = $state(commodity.legality.permit);
   let legalityPriority = $state(commodity.legality.priority);
   let isBroken = $state(commodity.isBroken);
   let name = $state(primary.name);
   let cleanupCreate, cleanupDelete;

   onMount(() => {
      const filter = (effect) =>
         effect?.parent?.id === document.id &&
         effect?.flags?.sr3e?.gadget?.origin === primary.flags?.sr3e?.gadget?.origin;

      const handleCreate = (effect) => {
         if (filter(effect)) refreshEffects();
      };

      const handleDelete = (effect) => {
         if (filter(effect)) refreshEffects();
      };

      Hooks.on("createActiveEffect", handleCreate);
      Hooks.on("deleteActiveEffect", handleDelete);

      cleanupCreate = () => Hooks.off("createActiveEffect", handleCreate);
      cleanupDelete = () => Hooks.off("deleteActiveEffect", handleDelete);

      refreshEffects();
   });

   onDestroy(() => {
      if (cleanupCreate) cleanupCreate();
      if (cleanupDelete) cleanupDelete();
   });

   function refreshEffects() {
      const origin = primary.flags?.sr3e?.gadget?.origin;
      effectsList = document.effects.contents.filter((e) => e.flags?.sr3e?.gadget?.origin === origin);
   }

   async function triggerRefresh() {
      Hooks.callAll("actorSystemRecalculated", document);
      refreshEffects();
   }

   $effect(() => {
      commodity.days = days;
      commodity.cost = cost;
      commodity.streetIndex = streetIndex;
      commodity.legality.status = legalityStatus;
      commodity.legality.permit = legalityPermit;
      commodity.legality.priority = legalityPriority;
      commodity.isBroken = isBroken;
      commodityStore.set(commodity.toObject());
   });

   const updateName = (e) => primary.update({ name: e.target.value });
   const addEffect = async () => {
      const gadgetFlags = {
         name: "New Effect",
         img: primary.img,
         isEnabled: true,
         type: "gadget",
         origin: primary.flags.sr3e.gadget.origin,
         gadgetType: primary.flags.sr3e.gadget.gadgetType,
         commodity: primary.flags.sr3e.gadget.commodity,
      };

      const newEffectData = {
         _id: foundry.utils.randomID(),
         name: "New Effect",
         icon: primary.img,
         changes: [],
         duration: {},
         disabled: false,
         flags: {
            sr3e: {
               gadget: gadgetFlags,
            },
         },
      };

      const [newEffect] = await document.createEmbeddedDocuments("ActiveEffect", [newEffectData]);
      const { default: ActiveEffectsEditor } = await import("@applications/ActiveEffectsEditor.js");
      ActiveEffectsEditor.launch(document, newEffect, config);
   };

   const editEffect = async ({ activeEffect }) => {
      const { default: ActiveEffectsEditor } = await import("@applications/ActiveEffectsEditor.js");
      ActiveEffectsEditor.launch(document, activeEffect, config, triggerRefresh);
   };

   const deleteEffect = async ({ activeEffect }) => {
      if (!activeEffect?.id) {
         console.warn("Attempted to delete effect without ID:", activeEffect);
         return;
      }

      await document.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id], { render: false });
      await triggerRefresh();
   };

   const canDeleteEffect = () => true;

   const entries = [
      {
         item: primary,
         key: "days",
         label: localize(config.commodity.days),
         value: days,
         path: "flags.sr3e.commodity",
         type: "number",
      },
      {
         item: primary,
         key: "cost",
         label: localize(config.commodity.cost),
         value: cost,
         path: "flags.sr3e.commodity",
         type: "number",
      },
      {
         item: primary,
         key: "streetIndex",
         label: localize(config.commodity.streetIndex),
         value: streetIndex,
         path: "flags.sr3e.commodity",
         type: "number",
      },
      {
         item: primary,
         key: "isBroken",
         label: localize(config.commodity.isBroken),
         value: isBroken,
         path: "flags.sr3e.commodity",
         type: "checkbox",
      },
   ];

   const singleColumnEntries = [
      {
         item: primary,
         key: "status",
         label: localize(config.commodity.legalstatus),
         value: legalityStatus,
         path: "flags.sr3e.commodity.legality",
         type: "select",
         options: Object.values(config.legalstatus).map(localize),
      },
      {
         item: primary,
         key: "permit",
         label: localize(config.commodity.legalpermit),
         value: legalityPermit,
         path: "flags.sr3e.commodity.legality",
         type: "select",
         options: Object.values(config.legalpermit).map(localize),
      },
      {
         item: primary,
         key: "priority",
         label: localize(config.commodity.legalenforcementpriority),
         value: legalityPriority,
         path: "flags.sr3e.commodity.legality",
         type: "select",
         options: Object.values(config.legalpriority).map(localize),
      },
   ];
</script>

<ItemSheetWrapper csslayout="single">
   <ItemSheetComponent>
      <Image entity={primary} />
      <input type="text" value={name} onchange={updateName} />
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h3>{localize(config.commodity.commodity)}</h3>
      <div class="stat-grid two-column">
         {#each entries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
      <div class="stat-grid single-column">
         {#each singleColumnEntries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <div class="effects-viewer">
         <table class="slim">
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
               {#each effectsList as childEffect (childEffect.id)}
                  <ActiveEffectsRow
                     effectData={{
                        activeEffect: childEffect,
                        sourceDocument: document,
                        canDelete: true,
                     }}
                     {config}
                     onEdit={editEffect}
                     onDelete={deleteEffect}
                     canDelete={canDeleteEffect}
                  />
               {/each}
            </tbody>
         </table>
      </div>
   </ItemSheetComponent>
</ItemSheetWrapper>
