<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import StatCard from "./StatCard.svelte";
import ItemSheetComponent from "./ItemSheetComponent.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const portability = (item.system as any).portability;

const entries = [
    { key: "conceal", label: localize(CONFIG.SR3E.PORTABILITY.concealability), value: portability.conceal, path: "system.portability", type: "number" as const },
    { key: "weight",  label: localize(CONFIG.SR3E.PORTABILITY.weight),          value: portability.weight,  path: "system.portability", type: "number" as const },
];
</script>

<ItemSheetComponent>
    <h3>{localize(CONFIG.SR3E.PORTABILITY.portability)}</h3>
    <div class="stat-grid two-column">
        {#each entries as entry}
            <StatCard {item} {...entry} />
        {/each}
    </div>
</ItemSheetComponent>
