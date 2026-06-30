<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { localize } from "../../services/utilities";
import ActiveEffectsRow from "./ActiveEffectsRow.svelte";

type AEDoc = Item | Actor;
type EffectData = { activeEffect: ActiveEffect; sourceDocument: AEDoc; canDelete: boolean };

const p = $props<{ document: AEDoc; isSlim?: boolean }>();
const doc = p.document;

let ownEffects = $state<ActiveEffect[]>([]);
let transferredEffects = $state<EffectData[]>([]);

const isActor = doc instanceof Actor;

function refresh() {
    ownEffects = (doc as any).effects.contents.filter((e: any) => !e.flags?.sr3e?.gadget);
    if (isActor) {
        transferredEffects = (doc as any).items.contents.flatMap((item: any) =>
            item.effects.contents.map((ae: any) => ({ activeEffect: ae, sourceDocument: item, canDelete: false }))
        );
    }
}

let cleanupHooks: (() => void)[] = [];

onMount(() => {
    const relevant = (e: any) => e?.parent?.id === (doc as any).id || (isActor && e?.parent?.parent?.id === (doc as any).id);
    for (const type of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
        const handler = (e: any) => relevant(e) && refresh();
        Hooks.on(type, handler);
        cleanupHooks.push(() => Hooks.off(type, handler));
    }
    refresh();
});

onDestroy(() => cleanupHooks.forEach(fn => fn()));

async function addEffect() {
    await (doc as any).createEmbeddedDocuments("ActiveEffect", [{
        name: "New Effect",
        icon: "icons/svg/aura.svg",
        origin: (doc as any).uuid,
        disabled: false,
        transfer: true,
        duration: { type: "none" },
        changes: [],
        flags: { sr3e: { source: "manual" } },
    }], { render: false });
}

async function editEffect(effectData: EffectData) {
    const { default: ActiveEffectsEditor } = await import("../../foundry/applications/ActiveEffectsEditor");
    ActiveEffectsEditor.launch(effectData.sourceDocument, effectData.activeEffect);
}

async function deleteEffect(effectData: EffectData) {
    await (effectData.sourceDocument as any).deleteEmbeddedDocuments("ActiveEffect", [effectData.activeEffect.id], { render: false });
}

function canDelete(effectData: EffectData): boolean {
    return effectData.canDelete;
}
</script>

<div class="effects-viewer">
    <table class:slim={p.isSlim}>
        <thead>
            <tr>
                <th><button type="button" class="fas fa-plus" onclick={addEffect}></button></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.name)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.durationType)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.enabled)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.actions)}</div></th>
            </tr>
        </thead>
        <tbody>
            {#each ownEffects as ae (ae.id)}
                <ActiveEffectsRow
                    effectData={{ activeEffect: ae, sourceDocument: doc, canDelete: true }}
                    onEdit={editEffect}
                    onDelete={deleteEffect}
                    {canDelete}
                />
            {/each}
            {#if isActor}
                {#each transferredEffects as effectData (effectData.activeEffect.id)}
                    <ActiveEffectsRow {effectData} onEdit={editEffect} onDelete={deleteEffect} {canDelete} />
                {/each}
            {/if}
        </tbody>
    </table>
</div>
