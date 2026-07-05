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
import { gadgetTargetIcon, isDefaultGadgetIcon } from "../../services/gadgets/gadgetIcons";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let imageSrc = $state(item.img ?? "");
const typeOptions = gadgetTargetOptions();
let gadgetType = $state(normalizeGadgetTargetItemType(system.type));

function updateGadgetType(type: string): void {
    const normalized = normalizeGadgetTargetItemType(type);
    gadgetType = normalized;

    const updates: Record<string, string> = { "system.type": normalized };
    if (isDefaultGadgetIcon(item.img)) {
        updates.img = gadgetTargetIcon(normalized);
        imageSrc = updates.img;
    }
    item.update(updates);
}
</script>

<ItemSheetWrapper csslayout="triple">
    <ItemSheetComponent>
        <Image entity={item} src={imageSrc} />
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
            <LabeledDropdown
                {item}
                key="type"
                label={localize(CONFIG.SR3E.GADGET.type)}
                value={gadgetType}
                path="system"
                options={typeOptions}
                onUpdate={updateGadgetType}
            />
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
