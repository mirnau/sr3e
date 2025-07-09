<script>
   import { localize } from "../../services/utilities.js";
   import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";
   import Image from "./components/basic/Image.svelte";
   import { StoreManager, stores } from "../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   import JournalViewer from "./components/JournalViewer.svelte";

   let { actor, config } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   // Use ShallowStore and BroadcastStore as per instructions
   let preparedNewsStore = storeManager.GetRWStore("preparedNews");
   let rollingNewsStore = storeManager.GetBroadcastStore(actor.id, "rollingNews", actor.system.rollingNews);
   let isBroadcastingStore = storeManager.GetRWStore("isBroadcasting");
   let headlineInput = $state("");
   let selectedPrepared = [];
   let selectedRolling = [];
   let layoutMode = "single";

   function addHeadline() {
      if (!headlineInput) return ui.notifications.warn("Headline cannot be empty.");
      $preparedNewsStore = [...$preparedNewsStore, headlineInput];
      headlineInput = "";
   }

   function deleteHeadlines() {
      if (!selectedPrepared.length) return ui.notifications.warn("Select at least one headline to delete.");

      let headlinesToDelete = selectedPrepared.map((i) => $preparedNewsStore[i]);
      $preparedNewsStore = $preparedNewsStore.filter((_, i) => !selectedPrepared.includes(i));
      $rollingNewsStore = $rollingNewsStore.filter((h) => !headlinesToDelete.includes(h));

      selectedPrepared = [];
   }

   function moveToRolling() {
      if (!selectedPrepared.length) return ui.notifications.warn("Select at least one headline to move.");

      let moved = selectedPrepared.map((i) => $preparedNewsStore[i]).filter(Boolean);
      $preparedNewsStore = $preparedNewsStore.filter((_, i) => !selectedPrepared.includes(i));
      $rollingNewsStore = [...$rollingNewsStore, ...moved.filter((h) => !$rollingNewsStore.includes(h))];

      selectedPrepared = [];
   }

   function moveToPrepared() {
      if (!selectedRolling.length) return ui.notifications.warn("Select at least one headline to move.");

      let moved = selectedRolling.map((i) => $rollingNewsStore[i]).filter(Boolean);
      $rollingNewsStore = $rollingNewsStore.filter((_, i) => !selectedRolling.includes(i));
      $preparedNewsStore = [...$preparedNewsStore, ...moved.filter((h) => !$preparedNewsStore.includes(h))];

      selectedRolling = [];
   }

   function updateSelectedHeadline() {
      if (selectedPrepared.length === 1) {
         headlineInput = $preparedNewsStore[selectedPrepared[0]] ?? "";
      } else {
         headlineInput = "";
      }
   }

   function commitName(event) {
      const newName = event.target.textContent.trim();
      if (newName !== actor.name) {
         actor.update({ name: newName });
      }
   }

   let lastBroadcast = null;
   $effect(() => {
      if ($isBroadcastingStore && rollingNewsStore && $rollingNewsStore !== lastBroadcast) {
         rollingNewsStore.set($rollingNewsStore);
         lastBroadcast = $rollingNewsStore;
      }
   });
</script>

<ItemSheetComponent>
   <div class="broadcaster-info">
      <Image entity={actor} />
      <div class="broadcaster-control">
         <div class="editable-actor-name">
            <h1
               class="no-margin"
               contenteditable="true"
               onblur={(e) => commitName(e)}
               onkeydown={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     e.currentTarget.blur();
                  }
               }}
            >
               {actor.name}
            </h1>
         </div>
         <div class="broadcast-toggle">
            <p>Broadcasting:</p>
            <input type="checkbox" id="broadcasting-toggle" bind:checked={$isBroadcastingStore} class="toggle-input" />
         </div>
      </div>
   </div>
</ItemSheetComponent>
<ItemSheetComponent>
   <div class="news-input">
      <input type="text" bind:value={headlineInput} placeholder="Write a headline" />
      <div class="buttons-vertical-distribution">
         <button type="button" class="link-button" title="Add Headline" aria-label="Add Headline" onclick={addHeadline}>
            <i class="fas fa-plus"></i>
         </button>
         <button
            type="button"
            class="link-button"
            title="Delete Headline"
            aria-label="Delete Headline"
            onclick={deleteHeadlines}
         >
            <i class="fas fa-trash-can"></i>
         </button>
      </div>
   </div>
</ItemSheetComponent>
<ItemSheetComponent>
   <div class="list-box">
      <h3>Prepared Headlines</h3>
      <select size="5" multiple bind:value={selectedPrepared} onchange={updateSelectedHeadline}>
         {#each $preparedNewsStore as headline, i}
            <option value={i}>{headline}</option>
         {/each}
      </select>
   </div>

   <div class="buttons-vertical-distribution">
      <button
         type="button"
         class="link-button"
         title="Move to Rolling News"
         aria-label="Move to Rolling News"
         onclick={moveToRolling}
      >
         <i class="fas fa-arrow-down"></i>
      </button>
      <button
         type="button"
         class="link-button"
         title="Move to Prepared News"
         aria-label="Move to Prepared News"
         onclick={moveToPrepared}
      >
         <i class="fas fa-arrow-up"></i>
      </button>
   </div>

   <div class="list-box">
      <h3>Rolling Headlines</h3>
      <select size="5" multiple bind:value={selectedRolling}>
         {#each $rollingNewsStore as headline, i}
            <option value={i}>{headline}</option>
         {/each}
      </select>
   </div>
</ItemSheetComponent>
<JournalViewer document={actor} {config} />
