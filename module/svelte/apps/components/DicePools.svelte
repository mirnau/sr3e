<script>
  import MasonryGrid from "./basic/MasonryGrid.svelte";
  import StatCard from "./basic/StatCard.svelte";
  import CardToolbar from "./CardToolbar.svelte";
  import { localize } from "../../../services/utilities.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { shoppingState } from "../../../svelteStore.js";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let dicePools = $state(actor.system.dicePools);
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each Object.entries(dicePools) as [key, stat]}
    <StatCard label={config.dicepools[key]} value={stat.value} />
  {/each}
</MasonryGrid>
