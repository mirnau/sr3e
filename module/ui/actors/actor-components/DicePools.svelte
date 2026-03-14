<script lang="ts">
   import { onDestroy } from "svelte";
   import { localize } from "../../../services/utilities";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import type SR3EActor from "../../../documents/SR3EActor";
   import StatCard from "./StatCard.svelte";

   let { actor }: { actor: SR3EActor } = $props();
   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

   let hasMatrixInterface = $state(false);
   let hasRiggerInterface = $state(false);

   const localization = $derived(CONFIG.SR3E.DICE_POOLS);

   function sumStore(path: string) {
      const value = storeManager.GetRWStore<number>(actor, `${path}.value`);
      const modifier = storeManager.GetRWStore<number>(
         actor,
         `${path}.modifier`,
      );
      return storeManager.GetSumROStore([value, modifier]);
   }

   storeManager.Subscribe(actor);

   const intelligence = sumStore("attributes.intelligence");
   const willpower = sumStore("attributes.willpower");
   const charisma = sumStore("attributes.charisma");
   const quickness = sumStore("attributes.quickness");
   const reaction = sumStore("attributes.reaction");
   const magic = sumStore("attributes.magic");

   const combat = sumStore("dicePools.combat");
   const combatValue = storeManager.GetRWStore<number>(
      actor,
      "dicePools.combat.value",
   );
   const control = sumStore("dicePools.control");
   const controlValue = storeManager.GetRWStore<number>(
      actor,
      "dicePools.control.value",
   );
   const hacking = sumStore("dicePools.hacking");
   const hackingValue = storeManager.GetRWStore<number>(
      actor,
      "dicePools.hacking.value",
   );
   const astral = sumStore("dicePools.astral");
   const astralValue = storeManager.GetRWStore<number>(
      actor,
      "dicePools.astral.value",
   );
   const spell = sumStore("dicePools.spell");
   const spellValue = storeManager.GetRWStore<number>(
      actor,
      "dicePools.spell.value",
   );

   const isShoppingState = storeManager.GetFlagStore<boolean>(
      actor,
      "isShoppingState",
      false,
   );
   const attributePreview = storeManager.GetShallowStore<any>(
      actor,
      "shoppingAttributePreview",
      { active: false, values: {} },
   );

   const isAwakened = $derived(
      $magic > 0 &&
         actor.items.some((item: any) => item.type === "magic") &&
         !actor.system?.attributes?.magic?.isBurnedOut,
   );

   onDestroy(() => storeManager.Unsubscribe(actor));

   $effect(() => {
      const preview = (key: string, fallback: number) =>
         $isShoppingState
            ? ($attributePreview?.values?.[key] ?? fallback)
            : fallback;

      const int = preview("intelligence", $intelligence);
      const qck = preview("quickness", $quickness);
      const wil = preview("willpower", $willpower);
      const cha = preview("charisma", $charisma);
      const mag = preview("magic", $magic);

      controlValue.set(Math.floor((int + qck) * 0.5));
      combatValue.set(Math.floor((int + qck + wil) * 0.5));
      astralValue.set(Math.floor((int + cha + wil) * 0.5));
      spellValue.set(Math.floor((int + mag + wil) / 3));
   });

   $effect(() => {
      const deck = actor.items.find(
         (it: any) =>
            it?.type === "techinterface" &&
            (it.system?.subtype === "cyberdeck" ||
               it.system?.subtype === "cyberterminal") &&
            it.getFlag?.("sr3e", "isEquipped"),
      );
      hasMatrixInterface = !!deck;
      hackingValue.set(
         deck
            ? Math.floor(
                 ($intelligence + Number(deck.system?.matrix?.mpcp ?? 0)) / 3,
              )
            : 0,
      );
   });

   $effect(() => {
      const rcDeck = actor.items.find(
         (it: any) =>
            it?.type === "techinterface" &&
            it.system?.subtype === "rcdeck" &&
            it.getFlag?.("sr3e", "isEquipped"),
      );
      hasRiggerInterface = !!rcDeck;
      controlValue.set(
         rcDeck
            ? $reaction + Number(actor.getFlag?.("sr3e", "vcrRating") ?? 0) * 2
            : 0,
      );
   });
</script>

<h1>{localize(localization.dicePools)}</h1>
<div class="stat-card-grid">
   <StatCard label={localize(localization?.combat)}>
      <span class="attribute-value">{$combat}</span>
   </StatCard>
   {#if hasRiggerInterface}
      <StatCard label={localize(localization?.control)}>
         <span class="attribute-value">{$control}</span>
      </StatCard>
   {/if}
   {#if hasMatrixInterface}
      <StatCard label={localize(localization?.hacking)}>
         <span class="attribute-value">{$hacking}</span>
      </StatCard>
   {/if}
   {#if isAwakened}
      <StatCard label={localize(localization?.astral)}>
         <span class="attribute-value">{$astral}</span>
      </StatCard>
      <StatCard label={localize(localization?.spell)}>
         <span class="attribute-value">{$spell}</span>
      </StatCard>
   {/if}
</div>
