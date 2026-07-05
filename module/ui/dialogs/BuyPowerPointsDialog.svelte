<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import { GOOD_KARMA_PER_POWER_POINT } from "../../services/magic/adeptPowerPoints";

const p = $props<{
    goodKarma: number;
    onconfirm: (quantity: number) => void;
    oncancel: () => void;
}>();

const goodKarma = untrack(() => p.goodKarma);
const maxAffordable = Math.floor(goodKarma / GOOD_KARMA_PER_POWER_POINT);

let quantity = $state(Math.min(1, maxAffordable));
const cost = $derived(quantity * GOOD_KARMA_PER_POWER_POINT);
const canConfirm = $derived(quantity > 0 && cost <= goodKarma);

function confirm() {
    if (canConfirm) p.onconfirm(quantity);
}
</script>

<div class="form-group">
    <label>{localize(CONFIG.SR3E.MAGIC.powerPoints)}</label>
    <div class="form-fields">
        <input type="number" min="0" max={maxAffordable} bind:value={quantity} />
    </div>
</div>
<p class="hint">{cost} / {goodKarma} Good Karma</p>
<div class="form-footer">
    <button type="button" disabled={!canConfirm} onclick={confirm}>{localize(CONFIG.SR3E.MODAL.confirm)}</button>
    <button type="button" onclick={p.oncancel}>{localize(CONFIG.SR3E.MODAL.decline)}</button>
</div>
