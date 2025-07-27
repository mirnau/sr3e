<script>
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";

   import CommodityModel from "@models/item/components/Commodity.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import ActiveEffectsRow from "@sveltecomponent/ActiveEffects/ActiveEffectsRow.svelte";
   import Switch from "@sveltecomponent/Switch.svelte";

   let { document, effects = [], config } = $props();

   const primary = effects[0];
   const storeManager = StoreManager.Subscribe(primary);
   onDestroy(() => StoreManager.Unsubscribe(primary));

   const commodityStore = storeManager.GetFlagStore("commodity");
   const commodity = new CommodityModel({ ...$commodityStore });

   const days = $state(commodity.days);
   const cost = $state(commodity.cost);
   const streetIndex = $state(commodity.streetIndex);
   const legalityStatus = $state(commodity.legality.status);
   const legalityPermit = $state(commodity.legality.permit);
   const legalityPriority = $state(commodity.legality.priority);
   const isBroken = $state(commodity.isBroken);
   const name = $state(primary.name);

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

   function updateName(e) {
      primary.update({ name: e.target.value });
   }

   function addEffect() {
      primary.parent?.createEmbeddedDocuments("ActiveEffect", [
         {
            _id: foundry.utils.randomID(),
            name: "New Effect",
            icon: primary.icon,
            changes: [],
            duration: {},
            disabled: false,
            flags: {
               sr3e: {
                  type: "gadget",
                  origin: primary.flags?.sr3e?.origin,
                  gadgetType: primary.flags?.sr3e?.gadgetType,
                  source: "manual",
                  commodity: primary.flags?.sr3e?.commodity ?? {},
               },
            },
         },
      ]);
   }

   function editEffect(effect) {
      effect.sheet?.render(true);
   }

   function deleteEffect(effect) {
      primary.parent?.deleteEmbeddedDocuments("ActiveEffect", [effect.id], { render: false });
   }

   function canDeleteEffect(effect) {
      return true;
   }

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
               {#each effects as childEffect (childEffect.id)}
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
