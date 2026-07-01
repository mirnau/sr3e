<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import ActiveEffectsViewer from "../common-components/ActiveEffectsViewer.svelte";
import GadgetViewer from "../common-components/GadgetViewer.svelte";
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
            <LabeledNumberInput {item} key="ballistic" label={localize(CONFIG.SR3E.WEARABLE.ballistic)} value={system.ballistic} path="system" />
            <LabeledNumberInput {item} key="impact"    label={localize(CONFIG.SR3E.WEARABLE.impact)}    value={system.impact}    path="system" />
        </div>
        <div class="stat-grid single-column">
            <LabeledBoolean {item} key="canLayer" label={localize(CONFIG.SR3E.WEARABLE.canlayer)} value={system.canLayer} path="system" />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>Gadget Attach Slot</h3>
        <GadgetViewer document={item} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <ActiveEffectsViewer document={item} isSlim={true} />
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
