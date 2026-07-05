<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import {
    computeDetectionFactor,
    cyberdeckMetricUpdates,
    numberValue,
    personaKeys,
    responseIncreaseMax,
} from "./cyberdeckCalculations";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = $derived((item.system as Record<string, any>));
const cyberdeck = $derived(CONFIG.SR3E.CYBERDECK);

let name = $state(item.name as string);

const mpcp = $derived(numberValue(system.mpcp));
const responseMax = $derived(responseIncreaseMax(mpcp));
const responseIncrease = $derived(Math.min(numberValue(system.stats?.responseIncrease), responseMax));
const personaSum = $derived(personaKeys.reduce((sum, key) => sum + numberValue(system.persona?.[key]), 0));
const personaMax = $derived(mpcp * 3);
const sleazeRating = $derived(Math.min(numberValue(system.sleazeRating), mpcp));
const detectionFactor = $derived(computeDetectionFactor(system.persona?.masking, sleazeRating, mpcp));

async function update(path: string, value: unknown): Promise<void> {
    await (item as any).update({ [path]: value, ...metricUpdates() }, { render: false });
}

async function updateMpcp(value: number): Promise<void> {
    const nextMpcp = Math.max(0, Math.round(value));
    const updates: Record<string, unknown> = { "system.mpcp": nextMpcp };
    for (const key of personaKeys) updates[`system.persona.${key}`] = Math.min(numberValue(system.persona?.[key]), nextMpcp);
    updates["system.sleazeRating"] = Math.min(numberValue(system.sleazeRating), nextMpcp);
    updates["system.stats.responseIncrease"] = Math.min(numberValue(system.stats?.responseIncrease), responseIncreaseMax(nextMpcp));
    await (item as any).update({ ...updates, ...metricUpdates(nextMpcp) }, { render: false });
}

async function updatePersona(key: string, value: number): Promise<void> {
    const current = personaKeys.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: numberValue(system.persona?.[k]) }), {});
    const otherSum = personaKeys.filter(k => k !== key).reduce((sum, k) => sum + current[k], 0);
    const capped = Math.max(0, Math.min(Math.round(value), mpcp, Math.max(0, personaMax - otherSum)));
    await (item as any).update({
        [`system.persona.${key}`]: capped,
        ...metricUpdates(mpcp, key === "masking" ? capped : system.persona?.masking),
    }, { render: false });
}

async function updateResponse(value: number): Promise<void> {
    await update("system.stats.responseIncrease", Math.max(0, Math.min(Math.round(value), responseMax)));
}

async function updateSleazeRating(value: number): Promise<void> {
    const capped = Math.max(0, Math.min(Math.round(value), mpcp));
    await (item as any).update({ "system.sleazeRating": capped, ...metricUpdates(mpcp, system.persona?.masking, capped) }, { render: false });
}

function metricUpdates(nextMpcp = mpcp, masking = system.persona?.masking, nextSleaze = sleazeRating): Record<string, unknown> {
    return cyberdeckMetricUpdates(item, masking, nextMpcp, nextSleaze);
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
            <LabeledNumberInput key="mpcp" label={localize(cyberdeck.mpcp)} value={mpcp} onUpdate={updateMpcp} />
            <LabeledNumberInput key="responseIncrease" label={localize(cyberdeck.responseIncrease)} value={responseIncrease} onUpdate={updateResponse} />
            <LabeledNumberInput {item} key="hardening" label={localize(cyberdeck.hardening)} value={system.stats?.hardening ?? 0} path="system.stats" />
            <LabeledNumberInput {item} key="ioSpeed" label={localize(cyberdeck.ioSpeed)} value={system.stats?.ioSpeed ?? 0} path="system.stats" />
            <LabeledNumberInput {item} key="essenceCost" label={localize(cyberdeck.essenceCost)} value={system.essenceCost ?? 0} path="system" step="0.01" />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.persona)}</h3>
        <div class="stat-grid two-column">
            {#each personaKeys as key}
                <LabeledNumberInput key={key} label={localize(cyberdeck[key])} value={system.persona?.[key] ?? 0} onUpdate={(value) => updatePersona(key, value)} />
            {/each}
            <LabeledNumberInput key="sleazeRating" label={localize(cyberdeck.sleazeRating)} value={sleazeRating} onUpdate={updateSleazeRating} />
            <LabeledNumberInput key="detectionFactor" label={localize(cyberdeck.detectionFactor)} value={detectionFactor} disabled={true} />
        </div>
        <p class:warning={personaSum > personaMax}>{localize(cyberdeck.personaSum)}: {personaSum} / {personaMax}</p>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.memory)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="active.max" label={localize(cyberdeck.activeMemory)} value={system.memory?.active?.max ?? 0} path="system.memory" />
            <LabeledNumberInput {item} key="storage.max" label={localize(cyberdeck.storageMemory)} value={system.memory?.storage?.max ?? 0} path="system.memory" />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
