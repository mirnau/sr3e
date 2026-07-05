<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";

const p = $props<{
    powerPointsAvailable: number;
    onconfirm: (quantity: number) => void;
    oncancel: () => void;
}>();

const powerPointsAvailable = untrack(() => p.powerPointsAvailable);

let quantity = $state(Math.min(1, powerPointsAvailable));
const canConfirm = $derived(quantity > 0 && quantity <= powerPointsAvailable);

function confirm() {
    if (canConfirm) p.onconfirm(quantity);
}
</script>

<div class="form-group">
    <label>{localize(CONFIG.SR3E.ADEPT_POWER.powerPointsAvailable)}</label>
    <div class="form-fields">
        <input type="number" min="0" max={powerPointsAvailable} bind:value={quantity} />
    </div>
</div>
<p class="hint">{quantity} / {powerPointsAvailable}</p>
<div class="form-footer">
    <button type="button" disabled={!canConfirm} onclick={confirm}>{localize(CONFIG.SR3E.MODAL.confirm)}</button>
    <button type="button" onclick={p.oncancel}>{localize(CONFIG.SR3E.MODAL.decline)}</button>
</div>
