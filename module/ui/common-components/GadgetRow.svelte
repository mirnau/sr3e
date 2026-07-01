<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Switch from "./Switch.svelte";
import GadgetEditorSheet from "../../foundry/applications/GadgetEditorSheet";
import { knownGadgetTargetItemType } from "../../services/gadgets/gadgetTargets";

const p = $props<{
    document: Item | Actor;
    activeEffects: ActiveEffect[];
    onHandleEffectTriggerUI: () => void;
}>();

const doc = untrack(() => p.document);
const primary = untrack(() => p.activeEffects[0]);
if (!primary) throw new Error("GadgetRow: no primary effect");

const canDetach = (doc as any).isEmbedded && (doc as any).parent instanceof Actor;
const gadgetFlags = (primary as any).flags?.sr3e?.gadget ?? {};
const gadgetName = gadgetFlags.name ?? (primary as any).name;
const gadgetImage = gadgetFlags.img ?? "icons/svg/mystery-man.svg";

let sheetInstance: unknown = null;
const enabled = $derived(!!(p.activeEffects[0] as any)?.flags?.sr3e?.gadget?.isEnabled);

async function onToggle(e: Event) {
    const on = (e.currentTarget as HTMLInputElement).checked;
    const updates = p.activeEffects.map(ae => ae.update({ disabled: !on, "flags.sr3e.gadget.isEnabled": on }, { render: false }));
    await Promise.all(updates);
    p.onHandleEffectTriggerUI();
}

function onEdit() {
    sheetInstance = new GadgetEditorSheet(doc, p.activeEffects);
    (sheetInstance as any).render(true);
}

async function onDetach() {
    const actor = (doc as any).parent as Actor;
    const sourceGadgetType = String(gadgetFlags.gadgetType ?? gadgetFlags.targetItemType ?? "");
    const targetItemType = knownGadgetTargetItemType(sourceGadgetType) ?? String(gadgetFlags.targetItemType ?? "");
    if (sourceGadgetType === "fetish") {
        (sheetInstance as any)?.close?.();
        sheetInstance = null;
        const ids = p.activeEffects.map(ae => ae.id!);
        await (doc as any).deleteEmbeddedDocuments("ActiveEffect", ids, { render: false });
        p.onHandleEffectTriggerUI();
        return;
    }
    const clonedEffects = p.activeEffects.map(ae => ({
        ...((ae as any).toObject()), _id: foundry.utils.randomID(),
    }));
    const [created] = await (actor as any).createEmbeddedDocuments("Item", [{
        name: gadgetFlags.name ?? "Gadget",
        img: gadgetFlags.img ?? "icons/svg/mystery-man.svg",
        type: "gadget",
        system: { type: targetItemType, commodity: gadgetFlags.commodity ?? {} },
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

<div class="gadget-slot-row" role="row">
    <div class="cell-content" role="cell">
        <span class="gadget-image-frame">
            <img class="gadget-image" src={gadgetImage} alt={gadgetName} />
        </span>
    </div>
    <div class="cell-content" role="cell">{gadgetName}</div>
    <div class="cell-content" role="cell">
        <Switch checked={enabled} ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)} onChange={onToggle} />
    </div>
    <div class="cell-content" role="cell">
        <div class="buttons-horizontal-distribution square">
            {#if canDetach}<button type="button" class="fas fa-eject" aria-label="Eject gadget" onclick={onDetach}></button>{/if}
            <button type="button" class="fas fa-edit" aria-label="Edit gadget" onclick={onEdit}></button>
        </div>
    </div>
</div>
