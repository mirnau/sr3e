<script>
  import { localize } from "../../../services/utilities.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";
  import StatCard from "./basic/StatCard.svelte";
  import MasonryGrid from "./basic/MasonryGrid.svelte";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();

  let attributes = $state(actor.system.attributes);

  let intelligenceBaseTotal = $derived(
    attributes.intelligence.value + attributes.intelligence.mod
  );
  let intelligence = $derived(
    intelligenceBaseTotal + (attributes.intelligence.meta ?? 0)
  );

  let quicknessBaseTotal = $derived(
    attributes.quickness.value + attributes.quickness.mod
  );
  let quickness = $derived(
    quicknessBaseTotal + (attributes.quickness.meta ?? 0)
  );

  let reaction = $derived(Math.floor(intelligence + quickness * 0.5));
  let augmentedReaction = $derived(reaction);

  let initiativeDice = 1;

</script>

<h1>{localize(config.initiative.initiative)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  <StatCard label={config.initiative.initiativeDice} value={initiativeDice} />
  <StatCard label={config.initiative.reaction} value={reaction} />
  <StatCard
    label={config.initiative.augmentedReaction}
    value={augmentedReaction}
  />
</MasonryGrid>
