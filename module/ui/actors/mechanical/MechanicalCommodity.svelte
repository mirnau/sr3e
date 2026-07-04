<script lang="ts">
import { localize } from "../../../services/utilities";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import LabeledNumberInput from "../../items/LabeledNumberInput.svelte";
import Foldout from "../actor-components/Foldout.svelte";

const p = $props<{ commodity: Record<string, any>; update: (path: string, value: string | number | boolean) => void }>();

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

const legality = $derived(p.commodity?.legality ?? {});
const legalStatusOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_STATUSES));
const legalPermitOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_PERMITS));
const legalPriorityOptions = $derived(kvOptions(CONFIG.SR3E.LEGAL_PRIORITIES));
</script>

<Foldout label={localize(CONFIG.SR3E.COMMODITY.commodity)}>
    <div class="stat-grid two-column">
        <LabeledNumberInput key="days" label={localize(CONFIG.SR3E.COMMODITY.days)} value={p.commodity?.days ?? 0} onUpdate={(v) => p.update("system.commodity.days", v)} />
        <LabeledNumberInput key="cost" label={localize(CONFIG.SR3E.COMMODITY.cost)} value={p.commodity?.cost ?? 0} onUpdate={(v) => p.update("system.commodity.cost", v)} />
        <LabeledNumberInput key="streetIndex" label={localize(CONFIG.SR3E.COMMODITY.streetIndex)} value={p.commodity?.streetIndex ?? 1} onUpdate={(v) => p.update("system.commodity.streetIndex", v)} />
        <LabeledBoolean key="isBroken" label={localize(CONFIG.SR3E.COMMODITY.isBroken)} value={p.commodity?.isBroken ?? false} onUpdate={(v) => p.update("system.commodity.isBroken", v)} />
    </div>
    <div class="stat-grid single-column">
        <LabeledDropdown key="status" label={localize(CONFIG.SR3E.COMMODITY.legalstatus)} value={legality.status ?? ""} options={legalStatusOptions} onUpdate={(v) => p.update("system.commodity.legality.status", v)} />
        <LabeledDropdown key="permit" label={localize(CONFIG.SR3E.COMMODITY.legalpermit)} value={legality.permit ?? ""} options={legalPermitOptions} onUpdate={(v) => p.update("system.commodity.legality.permit", v)} />
        <LabeledDropdown key="priority" label={localize(CONFIG.SR3E.COMMODITY.legalenforcementpriority)} value={legality.priority ?? ""} options={legalPriorityOptions} onUpdate={(v) => p.update("system.commodity.legality.priority", v)} />
    </div>
</Foldout>
