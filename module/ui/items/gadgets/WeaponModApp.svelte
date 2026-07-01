<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import ItemSheetComponent from "../../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../../common-components/ItemSheetWrapper.svelte";
import Switch from "../../common-components/Switch.svelte";
import ActiveEffectsEditor from "../../../foundry/applications/ActiveEffectsEditor";
import { gadgetTargetFromEffect, gadgetTargetLabel } from "../../../services/gadgets/gadgetTargets";
import { durationTypeFrom, durationValueFrom } from "../../common-components/activeEffectDurationUpdate";

const p = $props<{ document: Item | Actor; activeEffects: ActiveEffect[]; sheet: unknown }>();
const doc = untrack(() => p.document);
const primary = untrack(() => p.activeEffects[0]);
const initialEffects = untrack(() => [...p.activeEffects]);

const gadgetName = (primary as any)?.flags?.sr3e?.gadget?.name ?? "Gadget";
const gadgetImage = (primary as any)?.flags?.sr3e?.gadget?.img ?? "icons/svg/mystery-man.svg";
const targetItemType = primary ? gadgetTargetFromEffect(primary) ?? "—" : "—";
const gadgetOrigin = (primary as any)?.flags?.sr3e?.gadget?.origin;

type EffectRow = {
    activeEffect: ActiveEffect;
    name: string;
    target: string;
    durationLabel: string;
    enabled: boolean;
};

let effects = $state<EffectRow[]>(initialEffects.map(effectRowFrom));
let cleanupHooks: (() => void)[] = [];

onMount(() => {
    const refresh = () => refreshEffects();
    for (const hook of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
        Hooks.on(hook, refresh);
        cleanupHooks.push(() => Hooks.off(hook, refresh));
    }
    refreshEffects();
});

onDestroy(() => cleanupHooks.forEach(fn => fn()));

function refreshEffects() {
    const ownEffects = (doc as any).effects?.contents as ActiveEffect[] | undefined;
    if (!ownEffects || !gadgetOrigin) {
        effects = initialEffects.map(effectRowFrom);
        return;
    }
    effects = ownEffects
        .filter((ae: any) => ae.flags?.sr3e?.gadget?.origin === gadgetOrigin)
        .map(effectRowFrom);
}

function effectRowFrom(ae: ActiveEffect): EffectRow {
    return {
        activeEffect: ae,
        name: (ae as any).name,
        target: targetLabel(ae),
        durationLabel: durationLabel((ae as any).duration),
        enabled: !(ae as any).disabled,
    };
}

function durationLabel(duration: Record<string, unknown> | undefined): string {
    const d = duration ?? {};
    const type = durationTypeFrom(d);
    if (!type || type === "none") return localize(CONFIG.SR3E.EFFECTS.permanent);
    const val = durationValueFrom(d, type);
    return val !== undefined ? `${val} ${type}` : type;
}

function targetLabel(ae: ActiveEffect): string {
    return ((ae as any).flags?.sr3e?.target as string | undefined) ?? "self";
}

function openEditor(ae: ActiveEffect) {
    ActiveEffectsEditor.launch(doc, ae);
}
</script>

<ItemSheetWrapper csslayout="single">
    <ItemSheetComponent>
        <div class="gadget-editor-header">
            <span class="gadget-editor-image-frame">
                <img src={gadgetImage} alt={gadgetName} />
            </span>
            <div class="gadget-editor-title-stack">
                <h3>{gadgetName}</h3>
                <div class="gadget-editor-type">
                    <h4>{localize(CONFIG.SR3E.GADGET.type)}:</h4>
                    <span>{gadgetTargetLabel(targetItemType)}</span>
                </div>
            </div>
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <div class="gadget-editor-table" role="table">
            <div class="gadget-editor-table-header" role="row">
                <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.name)}</div>
                <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.target)}</div>
                <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.durationType)}</div>
                <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.enabled)}</div>
                <div role="columnheader">{localize(CONFIG.SR3E.EFFECTS.actions)}</div>
            </div>
            <div class="gadget-editor-table-body" role="rowgroup">
                {#each effects as effect (effect.activeEffect.id)}
                    <div class="gadget-editor-table-row" role="row">
                        <div class="cell-content" role="cell">{effect.name}</div>
                        <div class="cell-content" role="cell">{effect.target}</div>
                        <div class="cell-content" role="cell">{effect.durationLabel}</div>
                        <div class="cell-content" role="cell">
                            <Switch
                                enabled={effect.enabled}
                                ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)}
                                onChange={async (e) => {
                                    const on = (e.currentTarget as HTMLInputElement).checked;
                                    await effect.activeEffect.update({ disabled: !on }, { render: false });
                                }}
                            />
                        </div>
                        <div class="cell-content" role="cell">
                            <button type="button" class="fas fa-edit" aria-label={localize(CONFIG.SR3E.EFFECTS.actions)} onclick={() => openEditor(effect.activeEffect)}></button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </ItemSheetComponent>
</ItemSheetWrapper>
