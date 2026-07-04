<script lang="ts" module>
   export interface PoolRowApi {
      CommitSelected(): Promise<void>;
      SelectAll(): void;
      DeselectAll(): void;
      readonly readyForCommit: boolean;
   }
</script>

<script lang="ts">
   import { onDestroy, onMount, untrack } from "svelte";
   import type { Writable } from "svelte/store";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import Switch from "../../common-components/Switch.svelte";

   let {
      actor: _actor,
      onCommitStatusChange,
      onmount,
   }: {
      actor: Actor;
      onCommitStatusChange: () => void;
      onmount: (api: PoolRowApi) => void;
   } = $props();
   const actor = untrack(() => _actor);

   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
   storeManager.Subscribe(actor);
   onDestroy(() => storeManager.Unsubscribe(actor));

   const combatMax = storeManager.GetSimpleStatROStore(actor, "dicePools.combat");
   const combatSpent = storeManager.GetRWStore<number>(actor, "dicePools.combat.spent");
   const astralMax = storeManager.GetSimpleStatROStore(actor, "dicePools.astral");
   const astralSpent = storeManager.GetRWStore<number>(actor, "dicePools.astral.spent");
   const hackingMax = storeManager.GetSimpleStatROStore(actor, "dicePools.hacking");
   const hackingSpent = storeManager.GetRWStore<number>(actor, "dicePools.hacking.spent");
   const controlMax = storeManager.GetSimpleStatROStore(actor, "dicePools.control");
   const controlSpent = storeManager.GetRWStore<number>(actor, "dicePools.control.spent");
   const spellMax = storeManager.GetSimpleStatROStore(actor, "dicePools.spell");
   const spellSpent = storeManager.GetRWStore<number>(actor, "dicePools.spell.spent");

   const combatAvail = $derived(Math.max(0, $combatMax - $combatSpent));
   const astralAvail = $derived(Math.max(0, $astralMax - $astralSpent));
   const hackingAvail = $derived(Math.max(0, $hackingMax - $hackingSpent));
   const controlAvail = $derived(Math.max(0, $controlMax - $controlSpent));
   const spellAvail = $derived(Math.max(0, $spellMax - $spellSpent));

   // In-memory only — which pools this GM has marked to refresh doesn't
   // need to survive a reload, unlike the karma-commit flag it mirrors.
   const combatSelected = storeManager.GetShallowStore<boolean>(actor, "poolCommitCombat", false);
   const astralSelected = storeManager.GetShallowStore<boolean>(actor, "poolCommitAstral", false);
   const hackingSelected = storeManager.GetShallowStore<boolean>(actor, "poolCommitHacking", false);
   const controlSelected = storeManager.GetShallowStore<boolean>(actor, "poolCommitControl", false);
   const spellSelected = storeManager.GetShallowStore<boolean>(actor, "poolCommitSpell", false);

   const readyForCommit = $derived(
      $combatSelected || $astralSelected || $hackingSelected || $controlSelected || $spellSelected
   );

   onMount(() => {
      onmount({ CommitSelected, SelectAll, DeselectAll, get readyForCommit() { return readyForCommit; } });
   });

   $effect(() => {
      readyForCommit; // read to establish dependency
      onCommitStatusChange();
   });

   async function CommitSelected(): Promise<void> {
      const updates: Record<string, number> = {};
      if ($combatSelected) updates["system.dicePools.combat.spent"] = 0;
      if ($astralSelected) updates["system.dicePools.astral.spent"] = 0;
      if ($hackingSelected) updates["system.dicePools.hacking.spent"] = 0;
      if ($controlSelected) updates["system.dicePools.control.spent"] = 0;
      if ($spellSelected) updates["system.dicePools.spell.spent"] = 0;
      if (Object.keys(updates).length > 0) await actor.update(updates);
      DeselectAll();
   }

   function SelectAll(): void {
      if ($combatMax > 0) combatSelected.set(true);
      if ($astralMax > 0) astralSelected.set(true);
      if ($hackingMax > 0) hackingSelected.set(true);
      if ($controlMax > 0) controlSelected.set(true);
      if ($spellMax > 0) spellSelected.set(true);
   }

   function DeselectAll(): void {
      combatSelected.set(false);
      astralSelected.set(false);
      hackingSelected.set(false);
      controlSelected.set(false);
      spellSelected.set(false);
   }
</script>

{#snippet poolCell(max: number, avail: number, checked: boolean, store: Writable<boolean>)}
   {#if max > 0}
      <div class="pool-manager__cell">
         <span>({avail}/{max})</span>
         <Switch {checked} onChange={(e) => store.set((e.target as HTMLInputElement).checked)} ariaLabel="Refresh this pool" />
      </div>
   {:else}
      <span>(-)</span>
   {/if}
{/snippet}

<tr>
   <td><img class="portrait" src={actor.img} alt={actor.name} /></td>
   <td>{actor.name}</td>
   <td>{@render poolCell($combatMax, combatAvail, $combatSelected, combatSelected)}</td>
   <td>{@render poolCell($astralMax, astralAvail, $astralSelected, astralSelected)}</td>
   <td>{@render poolCell($hackingMax, hackingAvail, $hackingSelected, hackingSelected)}</td>
   <td>{@render poolCell($controlMax, controlAvail, $controlSelected, controlSelected)}</td>
   <td>{@render poolCell($spellMax, spellAvail, $spellSelected, spellSelected)}</td>
</tr>
