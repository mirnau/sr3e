<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { StoreManager } from "../../../../../utilities/StoreManager.svelte";
import { localize } from "../../../../../services/utilities";
import type { Readable } from "svelte/store";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
const storeManager = StoreManager.Instance;

storeManager.Subscribe(item);
onDestroy(() => storeManager.Unsubscribe(item));

const roundsStore = storeManager.GetRWStore<number>(item, "rounds");
const maxCapacityStore = storeManager.GetRWStore<number>(item, "maxCapacity");

const clipText = $derived.by(() => {
    const r = $roundsStore;
    const m = $maxCapacityStore;
    if (m === 0 && r === 0) return "Empty";
    if (m === 0) return `${r}`;
    return `${r}/${m}`;
});
</script>

<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0} — {sys.type ?? ""}</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.AMMUNITION.rounds)}: {clipText}
</h4>
