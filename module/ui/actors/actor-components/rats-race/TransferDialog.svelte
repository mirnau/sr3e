<script lang="ts">
import { untrack } from "svelte";
import { formatNuyen } from "./ratRaceEconomy";

const p = $props<{
   source: Item;
   targets: Item[];
   onconfirm: (target: Item, amount: number) => void;
   oncancel: () => void;
}>();

const sourceBalance = untrack(() => (p.source.system as any).amount as number);
let amount = $state(sourceBalance);
let selectedId = $state(untrack(() => (p.targets[0] as Item | undefined)?.id ?? ""));

function confirm() {
   const target = (p.targets as Item[]).find((t) => t.id === selectedId);
   if (target && amount > 0 && amount <= sourceBalance) p.onconfirm(target, amount);
}
</script>

<div class="transfer-dialog">
   {#if p.targets.length === 0}
      <span class="transfer-dialog-empty">No other credit sticks available</span>
   {:else}
      <input type="number" min="0" max={sourceBalance} bind:value={amount} />
      <select bind:value={selectedId}>
         {#each p.targets as target (target.id)}
            <option value={target.id}>{target.name} ({formatNuyen((target.system as any).amount)})</option>
         {/each}
      </select>
      <button type="button" onclick={confirm}>Confirm</button>
   {/if}
   <button type="button" onclick={p.oncancel}>Cancel</button>
</div>
