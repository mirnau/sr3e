<script>
   import { localize } from "../../../../services/utilities.js";
   import DicePoolRow from "./DicePoolRow.svelte";

   let { config } = $props();
   let delimiter = $state("");
   let filter = $state("character");
   let listboxContent = $state(null);

   const rowRefs = new Map();

   const options = [
      { value: "character", label: localize(config.karmamanager.character) },
      { value: "npc", label: localize(config.karmamanager.npc) },
   ];

   let anyReady = $state([]);

   function OnCommitStatusChange() {
      anyReady = Array.from(rowRefs.values()).some((row) => row.readyForCommit);
   }

   $effect(() => {
      let baseList = [];
      switch (filter) {
         case "character":
            baseList = game.actors.filter((a) => a.type === "character" && a.system?.karma && a.system?.dicePools);
            break;
         case "npc":
            baseList = game.actors.filter((a) => a.type === "npc" && a.system?.karma && a.system?.dicePools);
            break;
         default:
            baseList = game.actors.filter((a) => a.system?.karma);
            break;
      }

      listboxContent =
         delimiter?.length > 0
            ? baseList.filter((a) => a.name.toLowerCase().includes(delimiter.toLowerCase()))
            : baseList;
   });

   async function commitSelected() {
      for (const actor of listboxContent) {
         const row = rowRefs.get(actor.id);
         if (row?.CommitSelected) await row.CommitSelected();
      }
   }

   function selectAll() {
      for (const actor of listboxContent) {
         const row = rowRefs.get(actor.id);
         if (row?.Select) row.Select();
      }
   }

   function deselectAll() {
      for (const actor of listboxContent) {
         const row = rowRefs.get(actor.id);
         if (row?.Deselect) row.Deselect();
      }
   }

   function updateReadyState(actorId, isReady) {
      // No longer needed - rowRefs handle this directly
   }
</script>

<div class="sheet-component">
   <div class="sr3e-inner-background-container">
      <div class="fake-shadow"></div>
      <div class="sr3e-inner-background">
         <div class="karma-manager">
            <div class="points-container"></div>
            <div class="player-handler">
               <select name="typeOfCharacter" class="typeOfCharacter" bind:value={filter}>
                  {#each options as { value, label }}
                     <option {value}>{label}</option>
                  {/each}
               </select>
               <input type="text" bind:value={delimiter} />

               <button onclick={selectAll}>
                  {localize(config.karma.selectall)}
               </button>
               <button onclick={deselectAll}>
                  {localize(config.karma.deselectall)}
               </button>
               <button onclick={commitSelected} disabled={!anyReady}>
                  {localize(config.karma.commitselected)}
               </button>
            </div>
            <div class="list-box">
               {#if listboxContent?.length}
                  <table>
                     <thead>
                        <tr>
                           <th>Portrait</th>
                           <th>Name</th>
                           <th>{localize(config.karma.karmapool)}</th>
                           <th>{localize(config.dicepools.combat)}</th>
                           <th>{localize(config.dicepools.astral)}</th>
                           <th>{localize(config.dicepools.spell)}</th>
                           <th>{localize(config.dicepools.control)}</th>
                           <th>{localize(config.dicepools.hacking)}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {#each listboxContent as actor (actor.id)}
                           <DicePoolRow
                              {actor}
                              {config}
                              {OnCommitStatusChange}
                              onmount={(el) => rowRefs.set(actor.id, el)}
                           />
                        {/each}
                     </tbody>
                  </table>
               {:else}
                  <div class="empty">No actors found</div>
               {/if}
            </div>
         </div>
      </div>
   </div>
</div>
