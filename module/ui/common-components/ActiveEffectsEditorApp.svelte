<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { localize } from "../../services/utilities";
import ItemSheetComponent from "./ItemSheetComponent.svelte";
import ActiveEffectChangeRow from "./ActiveEffectChangeRow.svelte";

type Change = { key: string; mode: number; value: string; priority: number };
type Option = { value: string; label: string };

const p = $props<{ document: Item | Actor; activeEffect: ActiveEffect }>();
const ae = p.document;
const effect = p.activeEffect;

let name = $state((effect as any).name as string);
let target = $state(((effect as any).flags?.sr3e?.target as string) ?? "self");
let disabled = $state(!!(effect as any).disabled);
let duration = $state({ type: "none" as string, value: 0, ...((effect as any).duration ?? {}) });
let changes = $state<Change[]>([...((effect as any).changes ?? [])]);
let propertyOptions = $state<Option[]>([]);

onMount(() => enumeratePaths());
onDestroy(() => commit());

$effect(() => { void target; enumeratePaths(); });

function enumeratePaths() {
    const isCharacter = target === "character";
    const allowed = isCharacter
        ? ["system.attributes", "system.dicePools", "system.movement", "system.karma"]
        : ["system"];
    const source = isCharacter
        ? foundry.utils.flattenObject({ system: (new (CONFIG.Actor.dataModels["character"] as any)({})).toObject?.() ?? {} })
        : foundry.utils.flattenObject({ system: (ae as any).toObject?.()?.system ?? {} });
    propertyOptions = Object.keys(source)
        .filter(k => allowed.some(a => k.startsWith(a)) && k.endsWith(".mod"))
        .map(k => ({ value: k, label: k }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

async function commit() {
    const key = duration.type;
    await (effect as any).update({
        name,
        disabled,
        transfer: target === "character",
        duration: { type: key, [key]: duration.value },
        changes: [...changes],
        flags: { ...((effect as any).flags ?? {}), sr3e: { ...((effect as any).flags?.sr3e ?? {}), target } },
    }, { render: false });
}

function updateChange(index: number, field: string, value: unknown) {
    changes = changes.map((c, i) => i === index ? { ...c, [field]: value } : c);
}

function addChange() { changes = [...changes, { key: "", mode: 2, value: "", priority: 0 }]; }
function deleteChange(index: number) { changes = changes.filter((_, i) => i !== index); }
</script>

<ItemSheetComponent>
    <h3>{localize(CONFIG.SR3E.EFFECTS.effectscomposer)}</h3>
    <div class="stat-grid single-column">
        <div class="stat-card"><h4>{localize(CONFIG.SR3E.EFFECTS.name)}:</h4>
            <input type="text" bind:value={name} onblur={commit} /></div>
        <div class="stat-card"><h4>{localize(CONFIG.SR3E.EFFECTS.target)}:</h4>
            <select bind:value={target} onchange={commit}>
                <option value="self">self</option>
                <option value="character">character</option>
            </select></div>
        <div class="stat-card"><h4>{localize(CONFIG.SR3E.EFFECTS.disabled)}:</h4>
            <input type="checkbox" bind:checked={disabled} onchange={commit} /></div>
        <div class="stat-card"><h4>{localize(CONFIG.SR3E.EFFECTS.durationType)}:</h4>
            <select bind:value={duration.type} onchange={commit}>
                <option value="none">{localize(CONFIG.SR3E.EFFECTS.permanent)}</option>
                {#each ["turns","rounds","seconds","minutes","hours","days"] as t}
                    <option value={t}>{t}</option>
                {/each}
            </select></div>
        {#if duration.type !== "none"}
            <div class="stat-card"><h4>{localize(CONFIG.SR3E.EFFECTS.value)}:</h4>
                <input type="number" bind:value={duration.value} onblur={commit} /></div>
        {/if}
    </div>
</ItemSheetComponent>

<ItemSheetComponent>
    <h3>{localize(CONFIG.SR3E.EFFECTS.changesHeader)}</h3>
    <button type="button" onclick={addChange}>{localize(CONFIG.SR3E.EFFECTS.addChange)}</button>
    <table>
        <thead>
            <tr>
                <th>{localize(CONFIG.SR3E.EFFECTS.attributeKey)}</th>
                <th>{localize(CONFIG.SR3E.EFFECTS.changeMode)}</th>
                <th>{localize(CONFIG.SR3E.EFFECTS.value)}</th>
                <th>{localize(CONFIG.SR3E.EFFECTS.priority)}</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each changes as change, i}
                <ActiveEffectChangeRow {change} index={i} {propertyOptions} onUpdate={updateChange} onDelete={deleteChange} />
            {/each}
        </tbody>
    </table>
</ItemSheetComponent>
