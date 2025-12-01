<script lang="ts">
   import { onDestroy, onMount } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";

   import CommodityModel from "@models/item/components/Commodity.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import ActiveEffectsRow from "@sveltecomponent/ActiveEffects/ActiveEffectsRow.svelte";

   let { document, activeEffects, config, sheet } = $props();

   let effectsList = $state([]);
   const primary = activeEffects[0];

   const storeManager = StoreManager.Subscribe(primary);
   onDestroy(() => StoreManager.Unsubscribe(primary));

   const commodityStore = storeManager.GetFlagStore("gadget.commodity");

   // Initialize store with empty CommodityModel if it doesn't exist
   if (!$commodityStore) {
      $commodityStore = new CommodityModel({});
   }

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

   // Direct store update function
   function updateCommodityStore(updates) {
      $commodityStore = { ...$commodityStore, ...updates };

      for (const effect of effectsList) {
         effect.update({ [`flags.sr3e.gadget.commodity`]: $commodityStore }, { render: false });
      }
   }

   // Direct store update for nested legality
   function updateLegality(key, value) {
      $commodityStore = {
         ...$commodityStore,
         legality: { ...$commodityStore.legality, [key]: value },
      };

      for (const effect of effectsList) {
         effect.update({ [`flags.sr3e.gadget.commodity`]: $commodityStore }, { render: false });
      }
   }

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
      await document.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id], { render: false });
      await triggerRefresh();
   };

   $effect(() => {
      if (effectsList.length === 0) {
         console.warn("Closing GadgetEditorApp — no gadget effects left.");
         sheet.close();
      }
   });

   const canDeleteEffect = () => true;
   let entries = $state([]);
   let singleColumnEntries = $state([]);

   // Computed entries using direct store access
   $effect(() => {
      entries = [
         {
            item: primary,
            key: "days",
            label: localize(config.commodity.days),
            value: $commodityStore.days,
            path: "flags.sr3e.commodity",
            type: "number",
            onUpdate: (val) => updateCommodityStore({ days: val }),
         },
         {
            item: primary,
            key: "cost",
            label: localize(config.commodity.cost),
            value: $commodityStore.cost,
            path: "flags.sr3e.commodity",
            type: "number",
            onUpdate: (val) => updateCommodityStore({ cost: val }),
         },
         {
            item: primary,
            key: "streetIndex",
            label: localize(config.commodity.streetIndex),
            value: $commodityStore.streetIndex,
            path: "flags.sr3e.commodity",
            type: "number",
            onUpdate: (val) => updateCommodityStore({ streetIndex: val }),
         },
         {
            item: primary,
            key: "isBroken",
            label: localize(config.commodity.isBroken),
            value: $commodityStore.isBroken,
            path: "flags.sr3e.commodity",
            type: "checkbox",
            onUpdate: (val) => updateCommodityStore({ isBroken: val }),
         },
      ];
   });

   $effect(() => {
      singleColumnEntries = [
         {
            item: primary,
            key: "status",
            label: localize(config.commodity.legalstatus),
            value: $commodityStore.legality?.status,
            path: "flags.sr3e.commodity.legality",
            type: "select",
            options: Object.values(config.legalstatus).map(localize),
            onUpdate: (val) => updateLegality("status", val),
         },
         {
            item: primary,
            key: "permit",
            label: localize(config.commodity.legalpermit),
            value: $commodityStore.legality?.permit,
            path: "flags.sr3e.commodity.legality",
            type: "select",
            options: Object.values(config.legalpermit).map(localize),
            onUpdate: (val) => updateLegality("permit", val),
         },
         {
            item: primary,
            key: "priority",
            label: localize(config.commodity.legalenforcementpriority),
            value: $commodityStore.legality?.priority,
            path: "flags.sr3e.commodity.legality",
            type: "select",
            options: Object.values(config.legalpriority).map(localize),
            onUpdate: (val) => updateLegality("priority", val),
         },
      ];
   });
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
