<script lang="ts">
   import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
   import DerivedAttributeCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   import { flags } from "@services/commonConsts.js";
   import { onDestroy, onMount } from "svelte";


   let { actor = {}, config = {}, id = {}, span = {} } = $props();

   let isAwakened = $state(false);

   $effect(() => {
      isAwakened = actor.items.some((item) => item.type === "magic") && !actor.system.attributes.magic.isBurnedOut;
   });

   const storeManager = StoreManager.Subscribe(actor);
   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributePreview = storeManager.GetShallowStore(actor.id, "shoppingAttributePreview", { active: false, values: {} });

   let intelligence = storeManager.GetSumROStore("attributes.intelligence");
   let willpower = storeManager.GetSumROStore("attributes.willpower");
   let charisma = storeManager.GetSumROStore("attributes.charisma");
   let quickness = storeManager.GetSumROStore("attributes.quickness");
   let reaction = storeManager.GetSumROStore("attributes.reaction");
   let magic = storeManager.GetSumROStore("attributes.magic");

   let combat = storeManager.GetSumROStore("dicePools.combat");
   let combatValueStore = storeManager.GetRWStore("dicePools.combat.value");

   let control = storeManager.GetSumROStore("dicePools.control");
   let controlValueStore = storeManager.GetRWStore("dicePools.control.value");

   let hacking = storeManager.GetSumROStore("dicePools.hacking");
   let hackingValueStore = storeManager.GetRWStore("dicePools.hacking.value");
   let hasMatrixInterface = $state(false);
   let hasRiggerInterface = $state(false);
   let itemsUpdateTick = $state(0);

   onMount(() => {
      const collection = actor.items?.collection;
      const bump = () => (itemsUpdateTick = itemsUpdateTick + 1);
      if (collection) {
         collection.on("update", bump);
         collection.on("create", bump);
         collection.on("delete", bump);
      }
      const bumpHook = (doc) => { if (doc?.parent?.id === actor?.id) bump(); };
      Hooks.on("updateItem", bumpHook);
      Hooks.on("createItem", bumpHook);
      Hooks.on("deleteItem", bumpHook);
      return () => {
         collection?.off("update", bump);
         collection?.off("create", bump);
         collection?.off("delete", bump);
         Hooks.off("updateItem", bumpHook);
         Hooks.off("createItem", bumpHook);
         Hooks.off("deleteItem", bumpHook);
      };
   });

   let astral = storeManager.GetSumROStore("dicePools.astral");
   let astralValueStore = storeManager.GetRWStore("dicePools.astral.value");

   let spell = storeManager.GetSumROStore("dicePools.spell");
   let spellValueStore = storeManager.GetRWStore("dicePools.spell.value");

   $effect(() => {
      const previewOrFallback = (key, fallback) => $isShoppingState ? ($attributePreview?.values?.[key] ?? fallback) : fallback;
      const intelligenceValue = previewOrFallback("intelligence", $intelligence.sum);
      const quicknessValue = previewOrFallback("quickness", $quickness.sum);
      const willpowerValue = previewOrFallback("willpower", $willpower.sum);
      const charismaValue = previewOrFallback("charisma", $charisma.sum);
      const magicValue = previewOrFallback("magic", $magic.sum);
      const reactionPreview = Math.floor((intelligenceValue + quicknessValue) * 0.5);

      $controlValueStore = reactionPreview;                                   // preview Reaction
      $combatValueStore = Math.floor((intelligenceValue + quicknessValue + willpowerValue) * 0.5); // (/2)
      $astralValueStore = Math.floor((intelligenceValue + charismaValue + willpowerValue) * 0.5);  // (/2)
      $spellValueStore = Math.floor((intelligenceValue + magicValue + willpowerValue) / 3);        // (/3)
   });

   // Compute Hacking Pool based on equipped tech interface (cyberdeck/cyberterminal)
   $effect(() => {
      // react to item list changes and intelligence changes
      const _tick = itemsUpdateTick;
      const intSum = $intelligence.sum;

      const equipped = actor.items.find((it) =>
         it?.type === "techinterface" &&
         (it.system?.subtype === "cyberdeck" || it.system?.subtype === "cyberterminal") &&
         it.getFlag && it.getFlag("sr3e", "isEquipped")
      );

      if (!equipped) {
         hasMatrixInterface = false;
         $hackingValueStore = 0;
         return;
      }

      hasMatrixInterface = true;
      const mpcp = Number(equipped.system?.matrix?.mpcp ?? 0) || 0;
      const computed = Math.floor((Number(intSum || 0) + mpcp) / 3);
      $hackingValueStore = computed;
   });

   // Compute Control Pool based on equipped RC Deck (Remote Control Deck)
   // Control Pool = Reaction + (VCR Rating x 2)
   $effect(() => {
      const _tick = itemsUpdateTick;
      const reactionSum = $reaction.sum;

      const rcDeck = actor.items.find((it) =>
         it?.type === "techinterface" && it.system?.subtype === "rcdeck" && it.getFlag && it.getFlag("sr3e", "isEquipped")
      );

      if (!rcDeck) {
         hasRiggerInterface = false;
         $controlValueStore = 0;
         return;
      }

      hasRiggerInterface = true;
      // Attempt to read VCR rating from actor flag if present (defaults to 0 if not set)
      const vcrRating = Number(actor.getFlag?.("sr3e", "vcrRating") ?? 0) || 0;
      const computed = Number(reactionSum || 0) + vcrRating * 2;
      $controlValueStore = computed;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <DerivedAttributeCard document={actor} label={config.dicepools.combat} value={$combat.sum} key="combat" isButton={true} />
   {#if hasRiggerInterface}
      <DerivedAttributeCard document={actor} label={config.dicepools.control} value={$control.sum} key="control" isButton={true} />
   {/if}
   {#if hasMatrixInterface}
      <DerivedAttributeCard document={actor} label={config.dicepools.hacking} value={$hacking.sum} key="hacking" isButton={true} />
   {/if}
   {#if isAwakened}
      <DerivedAttributeCard document={actor} label={config.dicepools.astral} value={$astral.sum} key="astral" isButton={true} />
      <DerivedAttributeCard document={actor} label={config.dicepools.spell} value={$spell.sum} key="spell" isButton={true} />
   {/if}
</MasonryGrid>
