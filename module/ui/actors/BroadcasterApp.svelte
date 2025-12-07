<script lang="ts">
   import {
      broadcastNews,
      stopBroadcast,
   } from "../../services/NewsService.svelte";
   import SheetCard from "../common-components/SheetCard.svelte";
   import StoreManager from "../../utilities/StoreManager.svelte";
   import type { Writable } from "svelte/store";
   import type { IStoreManager } from "../../utilities/IStoreManager";

   let { actor } = $props<{
      actor: Actor;
   }>();

   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

   let preparedNewsStore = $state<Writable<string[]> | null>(null);
   let rollingNewsStore = $state<Writable<string[]> | null>(null);
   let isBroadcastingStore = $state<Writable<boolean> | null>(null);
   let headlineInput = $state("");
   let selectedPrepared = $state<number[]>([]);
   let selectedRolling = $state<number[]>([]);
   let isEditing = $state(false);

   $effect(() => {
      if (!actor) return;

      storeManager.Subscribe(actor);
      preparedNewsStore = storeManager.GetRWStore<string[]>(
         actor,
         "preparedNews",
      );
      rollingNewsStore = storeManager.GetRWStore<string[]>(
         actor,
         "rollingNews",
      );
      isBroadcastingStore = storeManager.GetRWStore<boolean>(
         actor,
         "isBroadcasting",
      );

      return () => {
         storeManager.Unsubscribe(actor);
      };
   });

   $effect(() => {
      if (!isBroadcastingStore || !rollingNewsStore) return;

      if ($isBroadcastingStore) {
         broadcastNews(actor.name, $rollingNewsStore as string[]);
      } else {
         stopBroadcast(actor.name);
      }
   });

   function addHeadline() {
      if (!preparedNewsStore) return;

      const trimmedInput = headlineInput.trim();
      if (!trimmedInput) return;

      if (isEditing && selectedPrepared.length === 1) {
         const index: number = selectedPrepared[0] as number;
         preparedNewsStore.update((current) => {
            const updated = [...current];
            updated[index] = trimmedInput;
            return updated;
         });
         isEditing = false;
         selectedPrepared = [];
      } else {
         preparedNewsStore.update((current) => [...current, trimmedInput]);
      }
      headlineInput = "";
   }

   function deleteHeadlines() {
      if (!preparedNewsStore || !rollingNewsStore) return;

      preparedNewsStore.update((currentPrepared) => {
         const headlinesToDelete = selectedPrepared
            .map((i) => currentPrepared[i])
            .filter(Boolean);

         // Also remove from rolling news
         rollingNewsStore?.update((currentRolling) =>
            currentRolling.filter((h) => !headlinesToDelete.includes(h)),
         );

         return currentPrepared.filter((_, i) => !selectedPrepared.includes(i));
      });

      selectedPrepared = [];
      headlineInput = "";
      isEditing = false;
   }

   function moveToRolling() {
      if (!preparedNewsStore || !rollingNewsStore) return;

      preparedNewsStore.update((currentPrepared) => {
         const moved = selectedPrepared
            .map((i) => currentPrepared[i])
            .filter(Boolean) as string[];

         // Add to rolling news (avoid duplicates)
         rollingNewsStore?.update((currentRolling) => [
            ...currentRolling,
            ...moved.filter((h) => !currentRolling.includes(h)),
         ]);

         return currentPrepared.filter((_, i) => !selectedPrepared.includes(i));
      });

      selectedPrepared = [];
      headlineInput = "";
      isEditing = false;
   }

   function moveToPrepared() {
      if (!preparedNewsStore || !rollingNewsStore) return;

      rollingNewsStore.update((currentRolling) => {
         const moved = selectedRolling
            .map((i) => currentRolling[i])
            .filter(Boolean) as string[];

         // Add to prepared news (avoid duplicates)
         preparedNewsStore?.update((currentPrepared) => [
            ...currentPrepared,
            ...moved.filter((h) => !currentPrepared.includes(h)),
         ]);

         return currentRolling.filter((_, i) => !selectedRolling.includes(i));
      });

      selectedRolling = [];
   }

   function updateSelectedHeadline() {
      if (!preparedNewsStore) return;

      if (selectedPrepared.length === 1) {
         preparedNewsStore.update((currentPrepared) => {
            headlineInput =
               currentPrepared[selectedPrepared[0] as number] || "";
            isEditing = true;
            return currentPrepared;
         });
      } else {
         headlineInput = "";
         isEditing = false;
      }
   }

   function commitName(event: Event) {
      const target = event.target as HTMLElement;
      const newName = target.textContent?.trim() || "";
      if (newName !== actor.name) {
         actor.update({ name: newName });
      }
   }
</script>

{#if actor && preparedNewsStore && rollingNewsStore && isBroadcastingStore}
   <SheetCard>
      <div class="broadcaster-info">
         <div class="broadcaster-image">
            <img src={actor.img} alt={actor.name} title={actor.name} />
         </div>
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
               <input
                  type="checkbox"
                  id="broadcasting-toggle"
                  bind:checked={$isBroadcastingStore}
                  class="toggle-input"
               />
            </div>
         </div>
      </div>
   </SheetCard>

   <SheetCard>
      <div class="news-input">
         <input
            type="text"
            bind:value={headlineInput}
            placeholder={isEditing ? "Edit headline" : "Write a headline"}
         />
         <div class="buttons-horizontal-distribution">
            <button
               type="button"
               class="link-button"
               title={isEditing ? "Update Headline" : "Add Headline"}
               aria-label={isEditing ? "Update Headline" : "Add Headline"}
               onclick={addHeadline}
            >
               <i class="fas {isEditing ? 'fa-save' : 'fa-plus'}"></i>
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
   </SheetCard>

   <SheetCard>
      <div class="list-box">
         <h3>Prepared Headlines</h3>
         <select
            size="5"
            multiple
            bind:value={selectedPrepared}
            onchange={updateSelectedHeadline}
         >
            {#each $preparedNewsStore as headline, i}
               <option value={i}>{headline}</option>
            {/each}
         </select>
      </div>

      <div class="buttons-horizontal-distribution">
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
   </SheetCard>

   {#if actor.system?.description}
      <SheetCard>
         <div class="broadcaster-description">
            <h3>Description</h3>
            <div class="description-content">
               {@html actor.system.description}
            </div>
         </div>
      </SheetCard>
   {/if}
{:else}
   <p>Loading broadcaster...</p>
{/if}
