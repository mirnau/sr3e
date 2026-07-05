<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;

let name = $state(item.name as string);

const levelOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
];

function updateLevel(value: string) {
    item.update({ "system.level": Number(value) }, { render: false });
}
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
        <div class="stat-grid two-column">
            <LabeledDropdown key="level" label={localize(CONFIG.SR3E.VEHICLE_CONTROL_RIG.level)} value={String(sys.level ?? 1)} options={levelOptions} onUpdate={updateLevel} />
            <LabeledNumberInput {item} key="essenceCost" label={localize(CONFIG.SR3E.VEHICLE_CONTROL_RIG.essenceCost)} value={sys.essenceCost ?? 0} path="system" />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    <JournalViewer document={item} />
</ItemSheetWrapper>
