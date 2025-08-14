<script>
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import { flags } from "@services/commonConsts.js";
   import { createEventDispatcher, onDestroy } from "svelte";
   import TextInput from "../basic/TextInput.svelte";

   let { specialization = $bindable(), actor = {}, skill = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   const dispatch = createEventDispatcher();

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);
   let baseValue = storeManager.GetRWStore("activeSkill.value");

   let liveText = specialization.name;

   $effect(() => {
      if (liveText !== specialization.name) {
         liveText = specialization.name;
      }
   });

   function handleInput(e) {
      liveText = e.target.innerText;
      specialization.name = liveText;
      dispatch("arrayChanged");
   }

   function handleKeyDown(e) {
      if (e.key === "Enter") {
         e.preventDefault();
         e.target.blur();
      }
   }

   function increment() {
      console.log("increment Entered");
   }

   function decrement() {
      console.log("decrement Entered");
   }

   function deleteThis() {
      if ($isCharacterCreationStore) {
         if (specialization.value === $baseValue + 2) {
            specialization.value = 0;
            $baseValue += 1;
            dispatch("arrayChanged");
         }
      }

      dispatch("delete", { specialization });
   }
</script>

<TextInput text={liveText} oninput={handleInput} onkeydown={handleKeyDown}>
   <h1 class="embedded-value no-margin">{specialization.value}</h1>
</TextInput>

<div class="buttons-horizontal-distribution">
   <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Increment"
      onclick={increment}
      disabled={$isCharacterCreationStore}
   >
      <i class="fa-solid fa-plus"></i>
   </button>
   <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Decrement"
      onclick={decrement}
      disabled={$isCharacterCreationStore}
   >
      <i class="fa-solid fa-minus"></i>
   </button>

   <button class="header-control icon sr3e-toolbar-button" aria-label="Delete" onclick={deleteThis}>
      <i class="fa-solid fa-trash-can"></i>
   </button>
</div>
