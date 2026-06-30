<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Switch from "./Switch.svelte";

const p = $props<{
    document: Item | Actor;
    activeEffects: ActiveEffect[];
    onHandleEffectTriggerUI: () => void;
}>();

const doc = untrack(() => p.document);
const primary = untrack(() => p.activeEffects[0]);
if (!primary) throw new Error("GadgetRow: no primary effect");

const canDetach = (doc as any).isEmbedded && (doc as any).parent instanceof Actor;

let sheetInstance: unknown = null;
let enabled = $state(!!(primary as any).flags?.sr3e?.gadget?.isEnabled ?? true);

async function onToggle(e: Event) {
    const on = (e.currentTarget as HTMLInputElement).checked;
    enabled = on;
    const updates = p.activeEffects.map(ae => ae.update({ disabled: !on, "flags.sr3e.gadget.isEnabled": on }, { render: false }));
    await Promise.all(updates);
    p.onHandleEffectTriggerUI();
}

async function onDelete() {
    (sheetInstance as any)?.close?.();
    sheetInstance = null;
    const ids = p.activeEffects.map(ae => ae.id!);
    await (doc as any).deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });
    p.onHandleEffectTriggerUI();
}

async function onEdit() {
    const { default: GadgetEditorSheet } = await import("../../foundry/applications/GadgetEditorSheet");
    sheetInstance = new GadgetEditorSheet(doc, p.activeEffects);
    (sheetInstance as any).render(true);
}

async function onDetach() {
    const actor = (doc as any).parent as Actor;
    const gadgetFlags = (primary as any).flags?.sr3e?.gadget ?? {};
    const clonedEffects = p.activeEffects.map(ae => ({
        ...((ae as any).toObject()), _id: foundry.utils.randomID(),
    }));
    const [created] = await (actor as any).createEmbeddedDocuments("Item", [{
        name: gadgetFlags.name ?? "Gadget",
        img: gadgetFlags.img ?? "icons/svg/mystery-man.svg",
        type: "gadget",
        system: { type: gadgetFlags.gadgetType ?? "", commodity: gadgetFlags.commodity ?? {} },
        effects: clonedEffects,
    }], { render: false });
    if (!created) return;
    (sheetInstance as any)?.close?.();
    sheetInstance = null;
    const ids = p.activeEffects.map(ae => ae.id!);
    await (doc as any).deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });
    p.onHandleEffectTriggerUI();
}
</script>

<tr>
    <td><div class="cell-content"><img src={(primary as any).img ?? "icons/svg/mystery-man.svg"} alt={(primary as any).flags?.sr3e?.gadget?.name} /></div></td>
    <td><div class="cell-content">{(primary as any).flags?.sr3e?.gadget?.name ?? (primary as any).name}</div></td>
    <td>
        <Switch {enabled} ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)} onChange={onToggle} />
    </td>
    <td>
        <div class="cell-content">
            <div class="buttons-horizontal-distribution square">
                {#if canDetach}<button type="button" class="fas fa-eject" onclick={onDetach}></button>{/if}
                <button type="button" class="fas fa-edit" onclick={onEdit}></button>
                <button type="button" class="fas fa-trash-can" onclick={onDelete}></button>
            </div>
        </div>
    </td>
</tr>
