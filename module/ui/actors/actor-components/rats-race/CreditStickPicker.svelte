<script lang="ts">
import { untrack } from "svelte";
import { formatNuyen } from "./ratRaceEconomy";

const p = $props<{
   sticks: Item[];
   onconfirm: (stick: Item) => void;
   oncancel: () => void;
}>();

let selectedId = $state(untrack(() => (p.sticks[0] as Item | undefined)?.id ?? ""));

function confirm() {
   const stick = (p.sticks as Item[]).find((s) => s.id === selectedId);
   if (stick) p.onconfirm(stick);
}
</script>

<div class="credit-stick-picker">
   {#if p.sticks.length === 0}
      <span class="credit-stick-picker-empty">No credit sticks available</span>
   {:else}
      <select bind:value={selectedId}>
         {#each p.sticks as stick (stick.id)}
            <option value={stick.id}>{stick.name} ({formatNuyen((stick.system as any).amount)})</option>
         {/each}
      </select>
      <button type="button" onclick={confirm}>Confirm</button>
   {/if}
   <button type="button" onclick={p.oncancel}>Cancel</button>
</div>
