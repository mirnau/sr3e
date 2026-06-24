<script lang="ts" module>
   export interface KarmaRowApi {
      CommitSelected(): Promise<void>;
      Select(): void;
      Deselect(): void;
      readonly readyForCommit: boolean;
   }
</script>

<script lang="ts">
   import { onDestroy, onMount, untrack } from "svelte";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import { KarmaDistributionService } from "../../../services/karma/KarmaDistributionService";

   let {
      actor: _actor,
      onCommitStatusChange,
      onmount,
   }: {
      actor: Actor;
      onCommitStatusChange: () => void;
      onmount: (api: KarmaRowApi) => void;
   } = $props();
   const actor = untrack(() => _actor);

   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
   storeManager.Subscribe(actor);

   const pendingKarmaReward = storeManager.GetRWStore<number>(actor, "karma.pendingKarmaReward");
   const goodKarma = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
   const karmaPoolCeiling = storeManager.GetRWStore<number>(actor, "karma.karmaPoolCeiling");
   const karmaPoolValue = storeManager.GetRWStore<number>(actor, "karma.karmaPool.value");
   const lifetimeKarma = storeManager.GetRWStore<number>(actor, "karma.lifetimeKarma");
   const readyForCommit = storeManager.GetRWStore<boolean>(actor, "karma.readyForCommit");

   async function refreshKarmaPool(): Promise<void> {
      await actor.update({ "system.karma.karmaPool.value": $karmaPoolCeiling });
   }

   onDestroy(() => storeManager.Unsubscribe(actor));

   onMount(() => {
      onmount({
         CommitSelected,
         Select,
         Deselect,
         get readyForCommit() { return $readyForCommit; },
      });
   });

   async function CommitSelected() {
      await KarmaDistributionService.Instance().CommitSelected(actor);
      onCommitStatusChange();
   }

   function Select() {
      $readyForCommit = true;
      onCommitStatusChange();
   }

   function Deselect() {
      $readyForCommit = false;
      onCommitStatusChange();
   }

   $effect(() => {
      $readyForCommit; // read to establish dependency
      onCommitStatusChange();
   });
</script>

<tr>
   <td><img class="portrait" src={actor.img} alt={actor.name} /></td>
   <td>{actor.name}</td>
   <td><input type="number" bind:value={$pendingKarmaReward} min="0" /></td>
   <td>{$goodKarma}</td>
   <td>{$karmaPoolValue} / {$karmaPoolCeiling}</td>
   <td>{$lifetimeKarma}</td>
   <td>
      <button type="button" class="karma-refresh-btn" onclick={refreshKarmaPool} title="Restore karma pool to ceiling">↺</button>
   </td>
   <td><input type="checkbox" bind:checked={$readyForCommit} /></td>
</tr>
