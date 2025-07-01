<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../services/utilities.js";

   let { actor, caller, type, dice, config, onclose } = $props();

   let targetNumber = "";
   let isDefaultingAsString = "false";

   let inputEl;
   let selectEl;
   let buttonEl;

   let canvas;
   let forms = [];
   let associatedDicepoolKeys = $state([]);

   onMount(() => {
      inputEl.focus();

      canvas = document.querySelector("canvas");
      if (canvas) {
         canvas.style.transition = "filter 0.2s ease";
         canvas.style.filter = "blur(5px)";
         canvas.style.pointerEvents = "none";
      }

      forms = Array.from(document.querySelectorAll("form")).filter((form) => !form.classList.contains("chat-form"));

      for (const form of forms) {
         form.style.transition = "filter 0.2s ease";
         form.style.filter = "blur(5px)";
         form.style.pointerEvents = "none";
      }

      associatedDicepoolKeys = ["combat", "control"];

      if (
         actor.items?.some((item) => item.type === "magic")
      ) {
         associatedDicepoolKeys.push("magic", "astral");
      }
   });

   onDestroy(() => {
      if (canvas) {
         canvas.style.filter = "";
         canvas.style.transition = "";
         canvas.style.pointerEvents = "";
      }

      for (const form of forms) {
         form.style.filter = "";
         form.style.transition = "";
         form.style.pointerEvents = "";
      }
   });

   const dicePoolOptions = $derived(() =>
      associatedDicepoolKeys.map((key) => ({
         value: key,
         label: localize(config.dicepools[key]),
      }))
   );

   function handleInputKeydown(e) {
      if (e.key === "Enter" || e.key === "Tab") {
         e.preventDefault();
         selectEl.focus();
      }
   }

   function handleSelectKeydown(e) {
      if (["ArrowUp", "w", "W"].includes(e.key)) {
         e.preventDefault();
         selectEl.selectedIndex = 0;
         isDefaultingAsString = selectEl.value;
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
         e.preventDefault();
         selectEl.selectedIndex = 1;
         isDefaultingAsString = selectEl.value;
      }
      if (e.key === "Enter" || e.key === "Tab") {
         e.preventDefault();
         buttonEl.focus();
      }
   }

   function handleButtonKeydown(e) {
      if (e.key === "Enter") {
         e.preventDefault();
         submit();
      }
      if (e.key === "Tab") {
         e.preventDefault();
         inputEl.focus();
      }
   }

   function submit() {
      let isDefaulting = isDefaultingAsString === "true";

      targetNumber = targetNumber < 2 || targetNumber === "" ? 2 : targetNumber;

      if (isDefaulting) {
         let baseTn = targetNumber;
         targetNumber += 2;
         console.log(
            `The target number ${baseTn} was increased to ${targetNumber}, to compensate for defaulting on linked skill`
         );
      }

      onclose({
         targetNumber: targetNumber,
         explodes: true,
         defaulted: isDefaulting,
      });
   }
</script>

{#if type === "attribute"}
   <div class="popup">
      <div class="popup-container">
         <h1>{localize(config.attributes[caller])} ROLL</h1>
         <div class="field-group">
            <h1>Target Number</h1>
            <input bind:this={inputEl} type="number" bind:value={targetNumber} onkeydown={handleInputKeydown} />
            <h1>Type of Roll</h1>
            <select bind:this={selectEl} bind:value={isDefaultingAsString} onkeydown={handleSelectKeydown}>
               <option value="false">Regular roll</option>
               <option value="true">Defaulting</option>
            </select>
            <button bind:this={buttonEl} onclick={submit} onkeydown={handleButtonKeydown} type="button">
               Roll the Dice!
            </button>

            <div>
               <h1>Associated Dicepool - if any</h1>
               <ul>
                  {#each dicePoolOptions as opt}
                     <li>{opt.label}</li>
                  {/each}
               </ul>
            </div>
         </div>
      </div>
   </div>
{/if}
