<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import {
    computeDetectionFactor,
    computeHackingPool,
    computeMatrixReaction,
    cyberdeckMetricUpdates,
    numberValue,
    personaKeys,
    responseIncreaseMax,
    sanitizeUtility,
    utilityTypes,
    type CyberdeckUtility,
} from "./cyberdeckCalculations";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = $derived((item.system as Record<string, any>));
const cyberdeck = $derived(CONFIG.SR3E.CYBERDECK);

let name = $state(item.name as string);

const utilities = $derived((system.utilities ?? []) as CyberdeckUtility[]);
const mpcp = $derived(numberValue(system.mpcp));
const responseMax = $derived(responseIncreaseMax(mpcp));
const responseIncrease = $derived(Math.min(numberValue(system.stats?.responseIncrease), responseMax));
const personaSum = $derived(personaKeys.reduce((sum, key) => sum + numberValue(system.persona?.[key]), 0));
const personaMax = $derived(mpcp * 3);
const activeUsed = $derived(utilities.filter(u => u.active).reduce((sum, u) => sum + numberValue(u.size), 0));
const storageUsed = $derived(utilities.reduce((sum, u) => sum + numberValue(u.size), 0));
const detectionFactor = $derived(computeDetectionFactor(system.persona?.masking, utilities, mpcp));
const hackingPool = $derived(computeHackingPool(item, mpcp));
const matrixReaction = $derived(computeMatrixReaction(item, responseIncrease));
const matrixInitiative = $derived(`${matrixReaction} + ${1 + responseIncrease}D6`);

async function update(path: string, value: unknown): Promise<void> {
    await (item as any).update({ [path]: value, ...metricUpdates() }, { render: false });
}

async function updateMpcp(value: number): Promise<void> {
    const nextMpcp = Math.max(0, Math.round(value));
    const updates: Record<string, unknown> = { "system.mpcp": nextMpcp };
    for (const key of personaKeys) updates[`system.persona.${key}`] = Math.min(numberValue(system.persona?.[key]), nextMpcp);
    updates["system.stats.responseIncrease"] = Math.min(numberValue(system.stats?.responseIncrease), responseIncreaseMax(nextMpcp));
    await (item as any).update({ ...updates, ...metricUpdates(nextMpcp) }, { render: false });
}

async function updatePersona(key: string, value: number): Promise<void> {
    const current = personaKeys.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: numberValue(system.persona?.[k]) }), {});
    const otherSum = personaKeys.filter(k => k !== key).reduce((sum, k) => sum + current[k], 0);
    const capped = Math.max(0, Math.min(Math.round(value), mpcp, Math.max(0, personaMax - otherSum)));
    await (item as any).update({
        [`system.persona.${key}`]: capped,
        ...metricUpdates(mpcp, utilities, key === "masking" ? capped : system.persona?.masking),
    }, { render: false });
}

async function updateResponse(value: number): Promise<void> {
    await update("system.stats.responseIncrease", Math.max(0, Math.min(Math.round(value), responseMax)));
}

async function addUtility(): Promise<void> {
    await setUtilities([...utilities, { name: "", rating: 0, size: 0, type: "operational", active: false }]);
}

async function updateUtility(index: number, patch: Partial<CyberdeckUtility>): Promise<void> {
    await setUtilities(utilities.map((utility, i) => i === index ? sanitizeUtility({ ...utility, ...patch }, mpcp) : utility));
}

async function deleteUtility(index: number): Promise<void> {
    await setUtilities(utilities.filter((_, i) => i !== index));
}

async function setUtilities(next: CyberdeckUtility[]): Promise<void> {
    await (item as any).update({ "system.utilities": next, ...metricUpdates(undefined, next) }, { render: false });
}

function metricUpdates(nextMpcp = mpcp, nextUtilities = utilities, masking = system.persona?.masking): Record<string, unknown> {
    return cyberdeckMetricUpdates(item, masking, nextMpcp, nextUtilities);
}
</script>

<ItemSheetWrapper csslayout="double">
    <ItemSheetComponent>
        <Image entity={item} />
        <div class="large-input-wrapper">
            <div class="large-input-background"></div>
            <input class="large" name="name" type="text" value={name} onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })} />
        </div>
        <div class="stat-grid two-column">
            <label>{localize(cyberdeck.mpcp)} <input type="number" min="0" value={mpcp} onchange={(e) => updateMpcp(numberValue((e.target as HTMLInputElement).value))} /></label>
            <label>{localize(cyberdeck.responseIncrease)} <input type="number" min="0" max={responseMax} value={responseIncrease} onchange={(e) => updateResponse(numberValue((e.target as HTMLInputElement).value))} /></label>
            <label>{localize(cyberdeck.hardening)} <input type="number" min="0" value={system.stats?.hardening ?? 0} onchange={(e) => update("system.stats.hardening", numberValue((e.target as HTMLInputElement).value))} /></label>
            <label>{localize(cyberdeck.ioSpeed)} <input type="number" min="0" value={system.stats?.ioSpeed ?? 0} onchange={(e) => update("system.stats.ioSpeed", numberValue((e.target as HTMLInputElement).value))} /></label>
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.persona)}</h3>
        <div class="stat-grid two-column">
            {#each personaKeys as key}
                <label>{localize(cyberdeck[key])} <input type="number" min="0" max={mpcp} value={system.persona?.[key] ?? 0} onchange={(e) => updatePersona(key, numberValue((e.target as HTMLInputElement).value))} /></label>
            {/each}
        </div>
        <p class:warning={personaSum > personaMax}>{localize(cyberdeck.personaSum)}: {personaSum} / {personaMax}</p>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.memory)}</h3>
        <div class="stat-grid two-column">
            <label>{localize(cyberdeck.activeMemory)} <input type="number" min="0" value={system.memory?.active?.max ?? 0} onchange={(e) => update("system.memory.active.max", numberValue((e.target as HTMLInputElement).value))} /></label>
            <label>{localize(cyberdeck.storageMemory)} <input type="number" min="0" value={system.memory?.storage?.max ?? 0} onchange={(e) => update("system.memory.storage.max", numberValue((e.target as HTMLInputElement).value))} /></label>
        </div>
        <p class:warning={activeUsed > numberValue(system.memory?.active?.max)}>{localize(cyberdeck.activeUsed)}: {activeUsed} / {system.memory?.active?.max ?? 0} Mp</p>
        <p class:warning={storageUsed > numberValue(system.memory?.storage?.max)}>{localize(cyberdeck.storageUsed)}: {storageUsed} / {system.memory?.storage?.max ?? 0} Mp</p>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.derived)}</h3>
        <p>{localize(cyberdeck.detectionFactor)}: {detectionFactor}</p>
        <p>{localize(cyberdeck.hackingPool)}: {hackingPool}</p>
        <p>{localize(cyberdeck.matrixInitiative)}: {matrixInitiative}</p>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(cyberdeck.utilities)}</h3>
        <button type="button" onclick={addUtility}>{localize(cyberdeck.addUtility)}</button>
        <div class="cyberdeck-utilities">
            {#each utilities as utility, i}
                <div class="utility-row">
                    <input value={utility.name} placeholder={localize(cyberdeck.utilityName)} onchange={(e) => updateUtility(i, { name: (e.target as HTMLInputElement).value })} />
                    <input type="number" min="0" max={mpcp} value={utility.rating} onchange={(e) => updateUtility(i, { rating: numberValue((e.target as HTMLInputElement).value) })} />
                    <input type="number" min="0" value={utility.size} onchange={(e) => updateUtility(i, { size: numberValue((e.target as HTMLInputElement).value) })} />
                    <select value={utility.type} onchange={(e) => updateUtility(i, { type: (e.target as HTMLSelectElement).value })}>
                        {#each utilityTypes as type}
                            <option value={type}>{localize(cyberdeck[type])}</option>
                        {/each}
                    </select>
                    <label>{localize(cyberdeck.active)} <input type="checkbox" checked={utility.active} onchange={(e) => updateUtility(i, { active: (e.target as HTMLInputElement).checked })} /></label>
                    <button type="button" aria-label={localize(cyberdeck.deleteUtility)} onclick={() => deleteUtility(i)}><i class="fas fa-trash-can"></i></button>
                </div>
            {/each}
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>

<style>
    .warning { color: var(--danger-color, #ff4b6e); }
    .cyberdeck-utilities { display: grid; gap: 0.35rem; }
    .utility-row { display: grid; grid-template-columns: 1.4fr 0.6fr 0.6fr 1fr 0.7fr auto; gap: 0.35rem; align-items: center; }
</style>
