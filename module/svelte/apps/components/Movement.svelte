<script>
  import StatCard from "./basic/StatCard.svelte";
  import MasonryGrid from "./basic/MasonryGrid.svelte";
  import CardToolbar from "./CardToolbar.svelte";
  import { localize } from "../../../services/utilities.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { shoppingState } from "../../../svelteStore.js";
  import { masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let movement = $state(actor.system.movement);

</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each Object.entries(movement) as [key, stat]}
    <StatCard label={config.movement[key]} value={stat.value} />
  {/each}
</MasonryGrid>
