<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";
import ItemSheetComponent from "./ItemSheetComponent.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const portability = (item.system as any).portability;
</script>

<ItemSheetComponent>
    <h3>{localize(CONFIG.SR3E.PORTABILITY.portability)}</h3>
    <div class="stat-grid two-column">
        <LabeledNumberInput {item} key="conceal" label={localize(CONFIG.SR3E.PORTABILITY.concealability)} value={portability.conceal} path="system.portability" />
        <LabeledNumberInput {item} key="weight"  label={localize(CONFIG.SR3E.PORTABILITY.weight)}         value={portability.weight}  path="system.portability" />
    </div>
</ItemSheetComponent>
