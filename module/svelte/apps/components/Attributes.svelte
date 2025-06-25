<script>
  import AttributeCardCreationState from "./basic/AttributeCardCreationState.svelte";
  import AttributeCardKarmaState from "./basic/AttributeCardKarmaState.svelte";
  import { localize } from "../../../services/utilities.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import CardToolbar from "./CardToolbar.svelte";
  import StatCard from "./basic/StatCard.svelte";
  import { getActorStore, stores } from "../../stores/actorStores.js";
  import {
    flags,
    masonryMinWidthFallbackValue,
  } from "../../../services/commonConsts.js";
  import MasonryGrid from "./basic/MasonryGrid.svelte";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let attributes = $state(actor.system.attributes);
  let localization = config.attributes;

  let attributeAssignmentLocked = getActorStore(
    actor.id,
    stores.attributeAssignmentLocked,
    actor.getFlag(flags.sr3e, flags.attributeAssignmentLocked)
  );

  let intelligenceMod = actor.getStore("attributes.intelligence.mod");
  let intelligenceMeta = actor.getStore("attributes.intelligence.meta");
  let intelligencevalue = actor.getStore("attributes.intelligence.value");
  let quicknessMod = actor.getStore("attributes.quickness.mod");
  let quicknessMeta = actor.getStore("attributes.quickness.meta");
  let quicknessValue = actor.getStore("attributes.quickness.value");

  let intelligence = $derived(
    $intelligencevalue + $intelligenceMod + $intelligenceMeta
  );

  let quickness = $derived($quicknessValue + $quicknessMod + $quicknessMeta);

  let reaction = $derived(Math.floor((intelligence + quickness) * 0.5));

  let augmentedReaction = $derived(reaction + getTotalModifiersFromItems());

  function getTotalModifiersFromItems() {
    ui.notifications.warn(
      "This function is not implemented yet. Please check the console for more details."
    );
    return 0;
  }
</script>

<CardToolbar {id} />
<h1>{localize(localization.attributes)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each Object.entries(attributes) as [key, stat]}
    {#if !$attributeAssignmentLocked}
      <AttributeCardCreationState {actor} {stat} {localization} {key} />
    {:else}
      <AttributeCardKarmaState {actor} {stat} {localization} {key} />
    {/if}
  {/each}
  <StatCard label={config.initiative.reaction} value={reaction} />
  <StatCard
    label={config.initiative.augmentedReaction}
    value={augmentedReaction}
  />
</MasonryGrid>
