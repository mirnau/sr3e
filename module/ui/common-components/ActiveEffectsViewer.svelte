<script lang="ts">
import { onMount, onDestroy, untrack } from "svelte";
import { localize } from "../../services/utilities";
import ActiveEffectsRow from "./ActiveEffectsRow.svelte";
import ActiveEffectsEditor from "../../foundry/applications/ActiveEffectsEditor";
import { activeEffectViewModel, type ActiveEffectViewModel } from "./activeEffectViewModel";
import { deleteActiveEffect } from "../../services/effects/activeEffectDeletion";

type AEDoc = Item | Actor;

const p = $props<{ document: AEDoc; isSlim?: boolean }>();
const doc = untrack(() => p.document);

let ownEffects = $state<ActiveEffectViewModel[]>([]);
let transferredEffects = $state<ActiveEffectViewModel[]>([]);

const isActor = doc instanceof Actor;

function refresh() {
    ownEffects = (doc as any).effects.contents
        .filter((e: any) => !e.flags?.sr3e?.gadget)
        .map((ae: ActiveEffect) => activeEffectViewModel(ae, doc, true));
    if (isActor) {
        transferredEffects = (doc as any).items.contents.flatMap((item: any) =>
            item.effects.contents
                .filter((e: any) => !e.flags?.sr3e?.gadget)
                .map((ae: ActiveEffect) => activeEffectViewModel(ae, item, true))
        );
    }
}

let cleanupHooks: (() => void)[] = [];

onMount(() => {
    const docUuid = (doc as any).uuid as string | undefined;
    const relevantEffect = (e: any) => e?.parent?.uuid === docUuid || (isActor && e?.parent?.parent?.uuid === docUuid);
    const relevantItem = (item: any) => isActor && item?.parent?.uuid === docUuid;
    for (const type of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
        const handler = (e: any) => relevantEffect(e) && refresh();
        Hooks.on(type, handler);
        cleanupHooks.push(() => Hooks.off(type, handler));
    }
    for (const type of ["createItem", "updateItem", "deleteItem"]) {
        const handler = (item: any) => relevantItem(item) && refresh();
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
        duration: {},
        changes: [],
        flags: { sr3e: { source: "manual" } },
    }], { render: false });
}

function editEffect(effectData: ActiveEffectViewModel) {
    ActiveEffectsEditor.launch(effectData.sourceDocument, effectData.activeEffect);
}

async function deleteEffect(effectData: ActiveEffectViewModel) {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: localize(CONFIG.SR3E.EFFECTS.deleteTitle) },
        content: game.i18n.format(CONFIG.SR3E.EFFECTS.deleteConfirm, { name: effectData.name }),
        yes: { label: localize(CONFIG.SR3E.MODAL.confirm), default: true },
        no: { label: localize(CONFIG.SR3E.MODAL.decline) },
        modal: true,
        rejectClose: true,
    });
    if (confirmed) await deleteActiveEffect(effectData.sourceDocument, effectData.activeEffect);
}

function canDelete(effectData: ActiveEffectViewModel): boolean {
    return effectData.canDelete;
}
</script>

<div class="effects-viewer">
    <table class:slim={p.isSlim}>
        <thead>
            <tr>
                <th><button type="button" class="fas fa-plus" aria-label="Add effect" onclick={addEffect}></button></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.name)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.durationType)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.enabled)}</div></th>
                <th><div class="cell-content">{localize(CONFIG.SR3E.EFFECTS.actions)}</div></th>
            </tr>
        </thead>
        <tbody>
            {#each ownEffects as effectData (effectData.id)}
                <ActiveEffectsRow
                    {effectData}
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
