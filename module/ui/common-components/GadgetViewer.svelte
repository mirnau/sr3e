<script lang="ts">
import { onMount, onDestroy, untrack } from "svelte";
import { localize } from "../../services/utilities";
import GadgetRow from "./GadgetRow.svelte";
import { gadgetTargetLabel, knownGadgetTargetItemType } from "../../services/gadgets/gadgetTargets";
import { durationTypeFrom } from "./activeEffectDurationUpdate";

const p = $props<{ document: Item | Actor; isSlim?: boolean }>();
const doc = untrack(() => p.document);

type GadgetGroup = { origin: string; effects: ActiveEffect[] };

let groups = $state<GadgetGroup[]>([]);
let dropZoneEl: HTMLElement;
let dragHover = $state(false);

function groupByOrigin(effects: ActiveEffect[]): GadgetGroup[] {
    const map = new Map<string, ActiveEffect[]>();
    for (const e of effects) {
        const origin = (e as any).flags?.sr3e?.gadget?.origin;
        if (!origin) continue;
        if (!map.has(origin)) map.set(origin, []);
        map.get(origin)!.push(e);
    }
    return Array.from(map.entries()).map(([origin, effects]) => ({ origin, effects }));
}

function refresh() {
    const gadgetEffects = (doc as any).effects.contents.filter((e: any) => e.flags?.sr3e?.gadget?.type === "gadget");
    groups = groupByOrigin(gadgetEffects);
}

async function onHandleEffectTriggerUI() {
    Hooks.callAll("actorSystemRecalculated", doc);
    refresh();
}

let cleanupHooks: (() => void)[] = [];

onMount(() => {
    const handler = (actor: unknown) => { if ((actor as any)?.id !== (doc as any).id) return; refresh(); };
    Hooks.on("actorSystemRecalculated", handler);
    cleanupHooks.push(() => Hooks.off("actorSystemRecalculated", handler));
    refresh();
});

onDestroy(() => cleanupHooks.forEach(fn => fn()));

async function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragHover = false;
    const raw = e.dataTransfer?.getData("text/plain");
    if (!raw) return;
    const data = JSON.parse(raw);
    const dropped = await fromUuid(data.uuid) as any;
    if (!(dropped instanceof Item) || dropped.type !== "gadget") return;
    const sourceGadgetType = String(dropped.system.type ?? "");
    const targetItemType = knownGadgetTargetItemType(sourceGadgetType);
    if (!targetItemType) { ui.notifications?.warn(localize("sr3e.notifications.warnnogadgettypeselected")); return; }
    if ((doc as any).type !== targetItemType) {
        ui.notifications?.warn(`${dropped.name} can only attach to ${gadgetTargetLabel(targetItemType)} items.`);
        return;
    }

    const gadgetFlags = {
        name: dropped.name,
        img: dropped.img,
        isEnabled: true,
        type: "gadget",
        origin: dropped.id,
        originUuid: dropped.uuid,
        sourceActorId: (dropped.parent as any)?.id,
        targetItemType,
        gadgetType: sourceGadgetType,
        commodity: dropped.system.commodity,
    };
    let effectsToAdd = (dropped as any).effects.contents.map((ae: any) => {
        const data = ae.toObject();
        return {
            ...data,
            _id: foundry.utils.randomID(),
            duration: durationForCreate(data.duration),
            flags: { ...ae.flags, sr3e: { ...ae.flags?.sr3e, gadget: gadgetFlags } },
        };
    });
    if (!effectsToAdd.length) effectsToAdd = [{ _id: foundry.utils.randomID(), name: gadgetFlags.name ?? "Gadget", img: gadgetFlags.img ?? "icons/svg/mystery-man.svg", changes: [], duration: {}, disabled: false, flags: { sr3e: { gadget: gadgetFlags } } }];

    await (doc as any).createEmbeddedDocuments("ActiveEffect", effectsToAdd, { render: false });
    if (sourceGadgetType !== "fetish") await deleteDroppedInventoryGadget(dropped);
    await onHandleEffectTriggerUI();
}

async function deleteDroppedInventoryGadget(dropped: Item) {
    const parent = (dropped as any).parent;
    const id = (dropped as any).id;
    if (!(parent instanceof Actor) || !id) return;
    await (parent as any).deleteEmbeddedDocuments("Item", [id]);
}

function durationForCreate(duration: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!duration || durationTypeFrom(duration) === "none") return {};
    return duration;
}
</script>

<div
    bind:this={dropZoneEl}
    class="drop-zone gadget-drop-zone"
    class:drag-hover={dragHover}
    role="region"
    aria-label="Gadget drop target"
    ondragover={(e) => { e.preventDefault(); e.dataTransfer && (e.dataTransfer.dropEffect = "move"); }}
    ondragenter={(e) => { e.preventDefault(); dragHover = true; }}
    ondragleave={(e) => { if (!dropZoneEl?.contains(e.relatedTarget as Node)) dragHover = false; }}
    ondrop={handleDrop}
>
    <div class="gadget-slot-table" class:slim={p.isSlim} role="table">
        <div class="gadget-slot-header" role="row">
            <div role="columnheader"></div>
            <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.name)}</div>
            <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.enabled)}</div>
            <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.actions)}</div>
        </div>
        <div class="gadget-slot-body" role="rowgroup">
            {#each groups as group (group.origin)}
                <GadgetRow document={doc} activeEffects={group.effects} {onHandleEffectTriggerUI} />
            {/each}
        </div>
    </div>
    {#if dragHover}<div class="drag-overlay"><div class="drop-indicator">Drop gadget here</div></div>{/if}
</div>
