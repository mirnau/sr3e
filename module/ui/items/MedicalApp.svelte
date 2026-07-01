<script lang="ts">
import { onMount, untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import ActiveEffectsViewer from "../common-components/ActiveEffectsViewer.svelte";
import GadgetViewer from "../common-components/GadgetViewer.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;

let name = $state(item.name as string);
let isReusable = $state(Boolean(sys.isReusable ?? false));

function isGadgetEffect(effect: ActiveEffect): boolean {
    return (effect as any).flags?.sr3e?.gadget?.type === "gadget";
}

function effectsToDeleteFor(reusable: boolean): string[] {
    return (item as any).effects.contents
        .filter((effect: ActiveEffect) => reusable ? !isGadgetEffect(effect) : isGadgetEffect(effect))
        .map((effect: ActiveEffect) => effect.id)
        .filter((id: string | null): id is string => typeof id === "string");
}

async function deleteInvalidEffects(reusable: boolean) {
    const effectIds = effectsToDeleteFor(reusable);
    if (!effectIds.length) return;

    await (item as any).deleteEmbeddedDocuments("ActiveEffect", effectIds, { render: false });
}

async function updateReusable(next: boolean) {
    isReusable = next;
    await item.update({ "system.isReusable": next }, { render: false });
    await deleteInvalidEffects(next);
}

onMount(() => {
    void deleteInvalidEffects(isReusable);
});
</script>

<ItemSheetWrapper csslayout="triple">
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
        <div class="stat-grid single-column">
            <LabeledBoolean
                {item}
                key="isReusable"
                label={localize(CONFIG.SR3E.MEDICAL.reusable)}
                value={isReusable}
                onUpdate={updateReusable}
            />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    {#if !isReusable}
        <ItemSheetComponent spanTwo={true}>
            <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
            <ActiveEffectsViewer document={item} isSlim={true} />
        </ItemSheetComponent>
    {/if}

    {#if isReusable}
        <ItemSheetComponent spanTwo={true}>
            <h3>{localize(CONFIG.SR3E.MEDICAL.medical)}</h3>
            <GadgetViewer document={item} isSlim={true} />
        </ItemSheetComponent>
    {/if}

    <JournalViewer document={item} />
</ItemSheetWrapper>
