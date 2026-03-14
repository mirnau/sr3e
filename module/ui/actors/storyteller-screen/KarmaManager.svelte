<script lang="ts">
   import KarmaRow, { type KarmaRowApi } from "./KarmaRow.svelte";
   import { KarmaDistributionService } from "../../../services/karma/KarmaDistributionService";

   let delimiter = $state("");
   const rowRefs = new Map<string, KarmaRowApi>();
   let anyReady = $state(false);

   const allActors = KarmaDistributionService.Instance().getCharacterActors();

   const filteredActors = $derived(
      delimiter.length > 0
         ? allActors.filter((a: Actor) => a.name!.toLowerCase().includes(delimiter.toLowerCase()))
         : allActors
   );

   function updateReadyState() {
      anyReady = Array.from(rowRefs.values()).some(row => row.readyForCommit);
   }

   async function commitSelected() {
      for (const a of filteredActors) {
         await rowRefs.get(a.id!)?.CommitSelected();
      }
   }

   function selectAll() {
      filteredActors.forEach((a: Actor) => rowRefs.get(a.id!)?.Select());
   }

   function deselectAll() {
      filteredActors.forEach((a: Actor) => rowRefs.get(a.id!)?.Deselect());
   }
</script>

<div class="karma-manager">
   <div class="karma-manager__toolbar">
      <input
         type="text"
         bind:value={delimiter}
         placeholder="Search characters..."
         class="karma-manager__search"
      />
      <button type="button" onclick={selectAll}>Select All</button>
      <button type="button" onclick={deselectAll}>Deselect All</button>
      <button type="button" onclick={commitSelected} disabled={!anyReady}>
         Commit Selected
      </button>
   </div>

   {#if filteredActors.length > 0}
      <table class="karma-manager__table">
         <thead>
            <tr>
               <th>Portrait</th>
               <th>Name</th>
               <th>Points</th>
               <th>Good Karma</th>
               <th>Karma Pool</th>
               <th>Lifetime Karma</th>
               <th>Commit</th>
            </tr>
         </thead>
         <tbody>
            {#each filteredActors as a (a.id)}
               <KarmaRow
                  actor={a}
                  onCommitStatusChange={updateReadyState}
                  onmount={(api) => rowRefs.set(a.id!, api)}
               />
            {/each}
         </tbody>
      </table>
   {:else}
      <p>No characters found.</p>
   {/if}
</div>
