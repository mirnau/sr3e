<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import StatCard from "../common-components/StatCard.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
</script>

<ItemSheetWrapper csslayout="double">
    <ItemSheetComponent>
        <Image entity={item} />
        <div class="large-input-wrapper">
            <div class="large-input-background"></div>
            <input
                class="large"
                name="name"
                type="text"
                value={name}
                onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
            />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.WEARABLE.wearable)}</h3>
        <div class="stat-grid two-column">
            <StatCard {item} key="ballistic" label={localize(CONFIG.SR3E.WEARABLE.ballistic)} value={system.ballistic} path="system" type="number" />
            <StatCard {item} key="impact"    label={localize(CONFIG.SR3E.WEARABLE.impact)}    value={system.impact}    path="system" type="number" />
        </div>
        <div class="stat-grid single-column">
            <StatCard {item} key="canLayer" label={localize(CONFIG.SR3E.WEARABLE.canlayer)} value={system.canLayer} path="system" type="checkbox" />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
