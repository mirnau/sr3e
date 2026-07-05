<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import { getComposerState, toggleComposerProgramModifier } from "../../../services/combat/procedures/composerService.svelte";
import { totalNumber } from "../../../models/common/modifiableNumber";

const p = $props<{ actor: any; program: any }>();
const composerState = untrack(() => getComposerState(p.actor.id));

// Foundry mutates the Item document in place on update — the `program`
// prop's object reference never changes, so a $derived reading
// p.program.system directly would never re-fire on edit. Bumping this on
// the item's own updateItem hook forces the recompute, same pattern as
// GarageVehicleSheet.svelte's vehicleItemsVersion/vehicleVersion.
let version = $state(0);

function onProgramUpdate(item: any): void {
    if (item.id !== p.program.id) return;
    version += 1;
}

const updateHookId = Hooks.on("updateItem", onProgramUpdate);
onDestroy(() => Hooks.off("updateItem", updateHookId));

const modifierId = $derived(`program-${p.program.id}`);
const programName = $derived.by(() => { void version; return p.program.name as string; });
const tnModifier = $derived.by(() => { void version; return totalNumber(p.program.system?.tnModifier); });
const isSelected = $derived(composerState.programModifiers.some((m) => m.id === modifierId));

function onModifierClick(): void {
    if (!composerState.isOpen) return;
    toggleComposerProgramModifier(p.actor.id, { id: modifierId, name: programName, value: tnModifier });
}

function openSheet(): void {
    p.program.sheet?.render(true);
}

async function onTrashClick(): Promise<void> {
    const confirmed = await (foundry.applications.api.DialogV2 as any).confirm({
        window: { title: localize(CONFIG.SR3E.MODAL.deletematrixprogramtitle) },
        content: `<p><strong>${programName}</strong></p>`,
        yes: { icon: "fa-solid fa-trash-can" },
        defaultYes: false,
    });
    if (!confirmed) return;
    await p.actor.deleteEmbeddedDocuments("Item", [p.program.id]);
}
</script>

<!-- svelte-ignore a11y_unknown_aria_attribute -->
<div class="asset-card matrix-program-card" role="presentation" aria-role="presentation">
    <div class="asset-background-layer"></div>
    <div class="image-mask">
        <img src={p.program.img} role="presentation" alt={programName} />
    </div>

    <div class="asset-card-column">
        <h3 class="no-margin uppercase">{programName}</h3>
        <div class="asset-card-row">
            <button
                type="button"
                class="attribute-value button matrix-program-mod"
                class:pool-active={isSelected}
                class:pool-pick-me={composerState.isOpen && !isSelected}
                onclick={onModifierClick}
            >
                {tnModifier > 0 ? `+${tnModifier}` : tnModifier}
            </button>
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-pencil"
                aria-label="Edit"
                onclick={openSheet}
            ></button>
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-trash-can"
                aria-label="Trash"
                onclick={onTrashClick}
            ></button>
        </div>
    </div>
</div>
