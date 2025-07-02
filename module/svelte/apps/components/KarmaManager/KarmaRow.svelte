<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../../services/utilities.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";

   let { actor, config, onmount } = $props();

   onMount(() => {
      if (onmount) {
         onmount({ CommitSelected, Select, Deselect });
      }
   });

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let pendingKarmaReward = storeManager.GetStore("karma.pendingKarmaReward");
   let goodKarma = storeManager.GetStore("karma.goodKarma");
   let karmaPool = storeManager.GetStore("karma.karmaPool");
   let spentKarma = storeManager.GetStore("karma.spentKarma");
   let lifetimeKarma = storeManager.GetStore("karma.lifetimeKarma");
   let readyForCommit = storeManager.GetStore("karma.readyForCommit");

   async function CommitSelected() {
      console.log("CommitSelected was called");

      if ($readyForCommit) {
         const metatypeItem = actor.items.find((i) => i.type === "metatype");
         console.log(metatypeItem);

         $lifetimeKarma += $pendingKarmaReward;

         if (metatypeItem.system.karma.factor) {
            $karmaPool = Math.floor($lifetimeKarma * metatypeItem.system.karma.factor);
         }

         $goodKarma = $lifetimeKarma - $spentKarma - $karmaPool;
         $pendingKarmaReward = 0;
         $readyForCommit = false;
      }
   }

   function Select() {
      $readyForCommit = true;
   }

   function Deselect() {
      $readyForCommit = false;
   }
</script>

<tr>
   <td class="portrait-cell">
      <img src={actor.img} alt="portrait" />
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
      <h3>{$karmaPool}</h3>
   </td>
   <td>
      <h3>{$lifetimeKarma}</h3>
   </td>
   <td>
      <input
         type="checkbox"
         bind:checked={$readyForCommit}
         onchange={async (e) => {
            const newValue = e.target.checked;
            $readyForCommit = newValue;
         }}
      />
   </td>
</tr>
