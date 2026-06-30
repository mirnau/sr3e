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
import { gadgetTargetOptions, normalizeGadgetTargetItemType } from "../../services/gadgets/gadgetTargets";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
const typeOptions = gadgetTargetOptions();
const gadgetType = normalizeGadgetTargetItemType(system.type);
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
            <LabeledDropdown {item} key="type" label={localize(CONFIG.SR3E.GADGET.type)} value={gadgetType} path="system" options={typeOptions} />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    <ItemSheetComponent spanTwo={true}>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <ActiveEffectsViewer document={item} isSlim={true} />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
