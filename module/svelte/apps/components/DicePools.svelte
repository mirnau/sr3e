<script>
   import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
   import DerivedAttributeCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   import { flags } from "@services/commonConsts.js";
   import { onDestroy } from "svelte";


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
   // hacking is fixed so no need to write to value directly

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

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <DerivedAttributeCard document={actor} label={config.dicepools.combat} value={$combat.sum} key="combat" isButton={true} />
   <DerivedAttributeCard document={actor} label={config.dicepools.control} value={$control.sum} key="control" isButton={true} />
   <DerivedAttributeCard document={actor} label={config.dicepools.hacking} value={$hacking.sum} key="hacking" isButton={true} />
   {#if isAwakened}
      <DerivedAttributeCard document={actor} label={config.dicepools.astral} value={$astral.sum} key="astral" isButton={true} />
      <DerivedAttributeCard document={actor} label={config.dicepools.spell} value={$spell.sum} key="spell" isButton={true} />
   {/if}
</MasonryGrid>
