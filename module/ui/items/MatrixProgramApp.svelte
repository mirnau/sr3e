<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import GadgetViewer from "../common-components/GadgetViewer.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import { baseNumber } from "../../models/common/modifiableNumber";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = $derived(item.system as Record<string, any>);
const matrixProgram = $derived(CONFIG.SR3E.MATRIX_PROGRAM);

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
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="value" label={localize(matrixProgram.tnModifier)} value={baseNumber(sys.tnModifier)} path="system.tnModifier" />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.GADGET_TYPES.patch)}</h3>
        <GadgetViewer document={item} />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
