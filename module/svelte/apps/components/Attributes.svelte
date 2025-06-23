<script>
  import AttributeCardCreationState from "./basic/AttributeCardCreationState.svelte";
  import AttributeCardKarmaState from "./basic/AttributeCardKarmaState.svelte";
  import { localize } from "../../../services/utilities.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import CardToolbar from "./CardToolbar.svelte";
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
</MasonryGrid>
