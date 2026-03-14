<script lang="ts">
   import { onDestroy, onMount } from "svelte";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import { KarmaDistributionService } from "../../../services/karma/KarmaDistributionService";

   interface KarmaRowApi {
      CommitSelected(): Promise<void>;
      Select(): void;
      Deselect(): void;
      readonly readyForCommit: boolean;
   }

   let {
      actor,
      onCommitStatusChange,
      onmount,
   }: {
      actor: Actor;
      onCommitStatusChange: () => void;
      onmount: (api: KarmaRowApi) => void;
   } = $props();

   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
   storeManager.Subscribe(actor);

   const pendingKarmaReward = storeManager.GetRWStore<number>(actor, "karma.pendingKarmaReward");
   const goodKarma = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
   const karmaPoolCeiling = storeManager.GetRWStore<number>(actor, "karma.karmaPoolCeiling");
   const lifetimeKarma = storeManager.GetRWStore<number>(actor, "karma.lifetimeKarma");
   const readyForCommit = storeManager.GetRWStore<boolean>(actor, "karma.readyForCommit");

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
   <td><img src={actor.img} alt={actor.name} /></td>
   <td>{actor.name}</td>
   <td><input type="number" bind:value={$pendingKarmaReward} min="0" /></td>
   <td>{$goodKarma}</td>
   <td>{$karmaPoolCeiling}</td>
   <td>{$lifetimeKarma}</td>
   <td><input type="checkbox" bind:checked={$readyForCommit} /></td>
</tr>

<style>
   td img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 2px;
   }

   td input[type="number"] {
      width: 60px;
   }
</style>
