<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../services/utilities";
import ItemSheetComponent from "../../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../../common-components/ItemSheetWrapper.svelte";
import Switch from "../../common-components/Switch.svelte";
import ActiveEffectsEditor from "../../../foundry/applications/ActiveEffectsEditor";
import { gadgetTargetFromEffect, gadgetTargetLabel } from "../../../services/gadgets/gadgetTargets";

const p = $props<{ document: Item | Actor; activeEffects: ActiveEffect[]; sheet: unknown }>();
const doc = untrack(() => p.document);

const gadgetName = (p.activeEffects[0] as any)?.flags?.sr3e?.gadget?.name ?? "Gadget";
const targetItemType = gadgetTargetFromEffect(p.activeEffects[0]) ?? "—";

function durationLabel(ae: ActiveEffect): string {
    const d = (ae as any).duration;
    if (!d?.type || d.type === "none") return localize(CONFIG.SR3E.EFFECTS.permanent);
    const val = d[d.type];
    return val !== undefined ? `${val} ${d.type}` : d.type;
}

function openEditor(ae: ActiveEffect) {
    ActiveEffectsEditor.launch(doc, ae);
}
</script>

<ItemSheetWrapper csslayout="single">
    <ItemSheetComponent>
        <h3>{gadgetName}</h3>
        <div class="stat-grid two-column">
            <div class="stat-card"><h4>{localize(CONFIG.SR3E.GADGET.type)}:</h4>
                <span>{gadgetTargetLabel(targetItemType)}</span></div>
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <table>
            <thead>
                <tr>
                    <th>{localize(CONFIG.SR3E.EFFECTS.name)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.durationType)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.enabled)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.actions)}</th>
                </tr>
            </thead>
            <tbody>
                {#each p.activeEffects as ae}
                    <tr>
                        <td>{(ae as any).name}</td>
                        <td>{durationLabel(ae)}</td>
                        <td>
                            <Switch
                                enabled={!(ae as any).disabled}
                                ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)}
                                onChange={async (e) => {
                                    const on = (e.currentTarget as HTMLInputElement).checked;
                                    await ae.update({ disabled: !on }, { render: false });
                                }}
                            />
                        </td>
                        <td>
                            <button type="button" class="fas fa-edit" onclick={() => openEditor(ae)}></button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </ItemSheetComponent>
</ItemSheetWrapper>
