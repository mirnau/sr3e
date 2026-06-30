<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import ActiveEffectsViewer from "../common-components/ActiveEffectsViewer.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}
</script>

<ItemSheetWrapper csslayout="triple">
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
        <div class="stat-grid single-column">
            <LabeledDropdown {item} key="type" label={localize(CONFIG.SR3E.GADGET.type)} value={system.type} path="system" options={kvOptions(CONFIG.SR3E.GADGET_TYPES)} />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    <ItemSheetComponent spanTwo={true}>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectscomposer)}</h3>
        <ActiveEffectsViewer document={item} isSlim={true} />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
