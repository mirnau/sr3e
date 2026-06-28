<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { StoreManager } from "../../../../../utilities/StoreManager.svelte";
import { localize } from "../../../../../services/utilities";

const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto"]);

const p = $props<{ item: Item; hasAmmo?: boolean; isFirearm?: boolean }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
const storeManager = StoreManager.Instance;

storeManager.Subscribe(item);

const ammoIdStore = storeManager.GetRWStore<string>(item, "ammoId");

let ammoItem: Item | null = null;
let roundsStore: ReturnType<typeof storeManager.GetRWStore<number>> | null = null;
let maxCapacityStore: ReturnType<typeof storeManager.GetRWStore<number>> | null = null;

$effect(() => {
    const ammoId = $ammoIdStore;
    if (ammoItem) {
        storeManager.Unsubscribe(ammoItem);
        ammoItem = null;
        roundsStore = null;
        maxCapacityStore = null;
    }
    if (!ammoId) return;
    const found = (item as any).parent?.items?.get(ammoId) as Item | undefined;
    if (!found) return;
    ammoItem = found;
    storeManager.Subscribe(ammoItem);
    roundsStore = storeManager.GetRWStore<number>(ammoItem, "rounds");
    maxCapacityStore = storeManager.GetRWStore<number>(ammoItem, "maxCapacity");
});

onDestroy(() => {
    if (ammoItem) storeManager.Unsubscribe(ammoItem);
    storeManager.Unsubscribe(item);
});

const isFirearm = $derived(FIREARM_MODES.has(sys.mode ?? ""));

const clipText = $derived.by(() => {
    if (!roundsStore || !maxCapacityStore) return "—";
    const r = $roundsStore;
    const m = $maxCapacityStore;
    if (m === 0 && r === 0) return "Empty";
    if (m === 0) return `${r}`;
    return `${r}/${m}`;
});

const hasAmmo = $derived(!isFirearm || (roundsStore !== null && $roundsStore > 0));
</script>

<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0} — {sys.mode ?? ""}</h4>
{#if isFirearm}
    <h4 class="no-margin uppercase">
        {localize(CONFIG.SR3E.AMMUNITION.rounds)}: {clipText}
    </h4>
{/if}
