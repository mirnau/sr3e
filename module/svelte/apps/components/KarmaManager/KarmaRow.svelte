<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../../services/utilities.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import Image from "../basic/Image.svelte";

   let { actor, config, OnCommitStatusChange, onmount } = $props();

   onMount(() => {
      if (onmount) {
         onmount({
            CommitSelected,
            Select,
            Deselect,
            get readyForCommit() {
               return $readyForCommit;
            },
         });
      }
   });

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let pendingKarmaReward = storeManager.GetRWStore("karma.pendingKarmaReward");
   let goodKarma = storeManager.GetRWStore("karma.goodKarma");
   let karmaPoolCeiling = storeManager.GetRWStore("karma.karmaPoolCeiling");
   let spentKarma = storeManager.GetRWStore("karma.spentKarma");
   let lifetimeKarma = storeManager.GetRWStore("karma.lifetimeKarma");
   let readyForCommit = storeManager.GetRWStore("karma.readyForCommit");

   async function CommitSelected() {
      if ($readyForCommit) {
         const metatypeItem = actor.items.find((i) => i.type === "metatype");

         $lifetimeKarma += $pendingKarmaReward;

         if (metatypeItem.system.karma.factor) {
            $karmaPoolCeiling = Math.floor($lifetimeKarma * metatypeItem.system.karma.factor);
         }

         $goodKarma = $lifetimeKarma - $spentKarma - $karmaPoolCeiling;
         $pendingKarmaReward = 0;
         $readyForCommit = false;
         OnCommitStatusChange();
      }
   }

   $effect(() => {
      let _ = $readyForCommit;
      OnCommitStatusChange();
   });

   function Select() {
      $readyForCommit = true;
      OnCommitStatusChange();
   }

   function Deselect() {
      $readyForCommit = false;
      OnCommitStatusChange();
   }
</script>

<tr>
   <td class="portrait-cell">
      <Image entity={actor} />
   </td>
   <td>
      <h3>{actor.name}</h3>
   </td>
   <td>
      <input type="number" id={actor.id} bind:value={$pendingKarmaReward} />
   </td>
   <td>
      <h3>{$goodKarma}</h3>
   </td>
   <td>
      <h3>{$karmaPoolCeiling}</h3>
   </td>
   <td>
      <h3>{$lifetimeKarma}</h3>
   </td>
   <td>
      <input type="checkbox" bind:checked={$readyForCommit} />
   </td>
</tr>
