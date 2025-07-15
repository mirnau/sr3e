<script>
   import { onMount } from "svelte";
   import { localize } from "../../../services/utilities.js";
   import CardToolbar from "./CardToolbar.svelte";
   import ElectroCardiogramService from "../../../services/ElectroCardiogramService.js";
   import StatCard from "./basic/StatCard.svelte";
   import { StoreManager } from "../../../svelte/svelteHelpers/StoreManager.svelte.js";

   let { actor = {}, config = {}, id = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);

   let stunArray = storeManager.GetRWStore("health.stun");
   let physicalArray = storeManager.GetRWStore("health.physical");
   let penalty = storeManager.GetRWStore("health.penalty");
   let overflow = storeManager.GetRWStore("health.overflow");

   let maxDegree = $state(0);
   let ecgCanvas = $state();
   let ecgPointCanvas = $state();
   let ecgService = $state();

   function toggle(localIndex, isStun, willBeChecked) {
      const currentArray = isStun ? $stunArray.slice() : $physicalArray.slice();

      if (willBeChecked) {
         // Fill up to the clicked box
         for (let i = 0; i <= localIndex; i++) currentArray[i] = true;
         for (let i = localIndex + 1; i < 10; i++) currentArray[i] = false;
      } else {
         // Uncheck from the clicked box onward
         for (let i = localIndex; i < 10; i++) currentArray[i] = false;
      }

      if (isStun) {
         $stunArray = currentArray;
      } else {
         $physicalArray = currentArray;
      }

      maxDegree = Math.max($stunArray.filter(Boolean).length, $physicalArray.filter(Boolean).length);
   }

   $effect(() => {
      $penalty = ecgService?.calculatePenalty($stunArray, $physicalArray);
   });

   let ecg;

   onMount(() => {
      ecgService = new ElectroCardiogramService(actor, {
         find: (selector) => {
            if (selector === "#ecg-canvas") return [ecgCanvas];
            if (selector === "#ecg-point-canvas") return [ecgPointCanvas];
            return [];
         },
         html: ecg.parentElement,
      });
   });

   function incrementOverflow() {
      $overflow = Math.min($overflow + 1, 10);
   }

   function decrementOverflow() {
      $overflow = Math.max($overflow - 1, 0);
   }
</script>

<CardToolbar {id} />

<div bind:this={ecg} class="ecg-container">
   <canvas bind:this={ecgCanvas} id="ecg-canvas" class="ecg-animation"></canvas>
   <canvas bind:this={ecgPointCanvas} id="ecg-point-canvas"></canvas>
   <div class="left-gradient"></div>
   <div class="right-gradient"></div>
</div>

<div class="condition-monitor">
   <div class="condition-meter">
      <div class="stun-damage">
         <h3 class="no-margin checkbox-label">Stun</h3>
         {#each Array(10) as _, i}
            <div class="damage-input">
               <input
                  class="checkbox"
                  type="checkbox"
                  id={`healthBox${i + 1}`}
                  checked={$stunArray[i]}
                  onchange={(e) => toggle(i, true, e.target.checked)}
               />
               {#if i === 0 || i === 2 || i === 5 || i === 9}
                  <div class="damage-description stun">
                     <h4 class="no-margin {$stunArray[i] ? 'lit' : 'unlit'}">
                        {["Light", "", "Moderate", "", "", "Serious", "", "", "", "Deadly"][i]}
                     </h4>
                  </div>
               {/if}
            </div>
         {/each}
      </div>
      <!-- svelte-ignore a11y_missing_attribute -->
      <div class="physical-damage">
         <h3 class="no-margin checkbox-label">Physical</h3>
         {#each Array(10) as _, i}
            <div class="damage-input">
               <input
                  class="checkbox"
                  type="checkbox"
                  id={`healthBox${i + 11}`}
                  checked={$physicalArray[i]}
                  onchange={(e) => toggle(i, false, e.target.checked)}
               />
               {#if i === 0 || i === 2 || i === 5 || i === 9}
                  <div class="damage-description physical">
                     <h4 class="no-margin {$physicalArray[i] ? 'lit' : 'unlit'}">
                        {["Light", "", "Moderate", "", "", "Serious", "", "", "", "Deadly"][i]}
                     </h4>
                  </div>
               {/if}
            </div>
         {/each}
         <!-- svelte-ignore a11y_missing_attribute -->

         <a
            class="overflow-button plus"
            role="button"
            tabindex="0"
            aria-label="Increase overflow"
            onclick={incrementOverflow}
            onkeydown={(e) => handleButtonKeypress(e, incrementOverflow)}
         >
            <i class="fa-solid fa-plus"></i>
         </a>

         <a
            class="overflow-button minus"
            role="button"
            tabindex="0"
            aria-label="Decrease overflow"
            onclick={decrementOverflow}
            onkeydown={(e) => handleButtonKeypress(e, decrementOverflow)}
         >
            <i class="fa-solid fa-minus"></i>
         </a>
      </div>
   </div>
   <div class="health-card-container">
      <div class="stat-grid single-column">
         <StatCard {actor} value={$penalty} label={localize(config.health.penalty)} />
         <StatCard {actor} value={$overflow} label={localize(config.health.overflow)} />
      </div>
   </div>
</div>
