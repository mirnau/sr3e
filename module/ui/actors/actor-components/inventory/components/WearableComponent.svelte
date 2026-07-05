<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../../../services/utilities";
import { StoreManager } from "../../../../../utilities/StoreManager.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const storeManager = StoreManager.Instance;
storeManager.Subscribe(item);

const costStore = storeManager.GetRWStore<number>(item, "commodity.cost");
const impactStore = storeManager.GetRWStore<number>(item, "impact");
const ballisticStore = storeManager.GetRWStore<number>(item, "ballistic");

onDestroy(() => storeManager.Unsubscribe(item));
</script>

<h4 class="no-margin uppercase">¥ {$costStore ?? 0}</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.WEARABLE.impact)}: {$impactStore ?? 0}
</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.WEARABLE.ballistic)}: {$ballisticStore ?? 0}
</h4>
