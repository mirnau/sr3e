<script lang="ts">
import { untrack } from "svelte";
import { formatNuyen } from "./ratRaceEconomy";

const p = $props<{
   debtRemaining: number;
   sticks: Item[];
   onconfirm: (stick: Item, amount: number) => void;
   oncancel: () => void;
}>();

let selectedId = $state(untrack(() => (p.sticks[0] as Item | undefined)?.id ?? ""));
const selectedStick = $derived((p.sticks as Item[]).find((s) => s.id === selectedId));
const maxAmount = $derived(Math.min(p.debtRemaining, (selectedStick?.system as any)?.amount ?? 0));

let amount = $state(untrack(() => Math.min(p.debtRemaining, (p.sticks[0]?.system as any)?.amount ?? 0)));
$effect(() => {
   if (amount > maxAmount) amount = maxAmount;
});

function confirm() {
   if (selectedStick && amount > 0 && amount <= maxAmount) p.onconfirm(selectedStick, amount);
}
</script>

<div class="debt-payment-dialog">
   {#if p.sticks.length === 0}
      <span class="debt-payment-dialog-empty">No credit sticks available</span>
   {:else}
      <select bind:value={selectedId}>
         {#each p.sticks as stick (stick.id)}
            <option value={stick.id}>{stick.name} ({formatNuyen((stick.system as any).amount)})</option>
         {/each}
      </select>
      <input type="number" min="0" max={maxAmount} bind:value={amount} />
      <button type="button" onclick={confirm}>Confirm</button>
   {/if}
   <button type="button" onclick={p.oncancel}>Cancel</button>
</div>
