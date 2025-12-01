<script lang="ts">
   import { onDestroy, onMount } from "svelte";
   import { localize } from "@services/utilities.js";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";
   import ElectroCardiogramService from "@services/ElectroCardiogramService.js";
   import StatCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";

   let { actor = {}, config = {}, id = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let stun = storeManager.GetRWStore("health.stun.value");
   let physical = storeManager.GetRWStore("health.physical.value");
   let penalty = storeManager.GetRWStore("health.penalty.value");
   let overflow = storeManager.GetRWStore("health.overflow.value");
   let miraculousSurvivalStore = storeManager.GetRWStore(
      "karma.miraculousSurvival",
   );
   let isAlive = storeManager.GetRWStore("health.isAlive");

   let maxDegree = $state(0);
   let ecgCanvas = $state();
   let ecgPointCanvas = $state();
   let ecgService = $state();
   let ecg;

   let stunBoxes = $state([]);
   let physicalBoxes = $state([]);

   $effect(() => {
      stunBoxes = Array.from({ length: 10 }, (_, i) => i < $stun);
      physicalBoxes = Array.from({ length: 10 }, (_, i) => i < $physical);
   });

   $effect(() => {
      if (!ecgService) return;

      if (!$isAlive) {
         ecgService.ecgAnimator.flatline();
      } else {
         ecgService.ecgAnimator.start();
      }
   });

   $effect(() => {
      $penalty = ecgService?.calculatePenalty($stun, $physical);
   });

   async function revive() {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
         window: {
            title: "Revive Character",
         },
         content: `
         <p>Are you sure you want to use your one-time <strong>Miraculous Survival</strong>?</p>
         <p>This action cannot be undone.</p>
      `,
         yes: {
            icon: '<i class="fa-solid fa-heart-pulse"></i>',
            label: "Yes, Revive",
            default: true,
         },
         no: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: "Cancel",
         },
         modal: true,
         rejectClose: true,
      });

      if (!confirmed) return;

      $overflow = 0;
      $isAlive = true;
      $miraculousSurvivalStore = true;
   }

   function toggle(localIndex, isStun, willBeChecked) {
      const newValue = willBeChecked ? localIndex + 1 : localIndex;
      if (isStun) {
         $stun = newValue;
      } else {
         $physical = newValue;
      }
      maxDegree = Math.max($stun, $physical);
   }

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

   function handleButtonKeypress(e, fn) {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         fn();
      }
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
      {#if !$miraculousSurvivalStore}
         <div class="revival-button">
            <i
               class="fa-solid fa-heart-circle-bolt"
               role="button"
               tabindex="0"
               aria-label="Revive"
               onclick={revive}
               onkeydown={(e) => handleButtonKeypress(e, revive)}
            ></i>
         </div>
      {:else}
         <!--display nothing-->
      {/if}
      <div class="stun-damage">
         <h3 class="no-margin checkbox-label">Stun</h3>
         {#each stunBoxes as checked, i}
            <div class="damage-input">
               <input
                  class="checkbox"
                  type="checkbox"
                  id={`healthBox${i + 1}`}
                  {checked}
                  onchange={(e) => toggle(i, true, e.target.checked)}
               />
               {#if i === 0 || i === 2 || i === 5 || i === 9}
                  <div class="damage-description stun">
                     <h4 class="no-margin {checked ? 'lit' : 'unlit'}">
                        {[
                           "Light",
                           "",
                           "Moderate",
                           "",
                           "",
                           "Serious",
                           "",
                           "",
                           "",
                           "Deadly",
                        ][i]}
                     </h4>
                  </div>
               {/if}
            </div>
         {/each}
      </div>

      <div class="physical-damage">
         <h3 class="no-margin checkbox-label">Physical</h3>
         {#each physicalBoxes as checked, i}
            <div class="damage-input">
               <input
                  class="checkbox"
                  type="checkbox"
                  id={`healthBox${i + 11}`}
                  {checked}
                  onchange={(e) => toggle(i, false, e.target.checked)}
               />
               {#if i === 0 || i === 2 || i === 5 || i === 9}
                  <div class="damage-description physical">
                     <h4 class="no-margin {checked ? 'lit' : 'unlit'}">
                        {[
                           "Light",
                           "",
                           "Moderate",
                           "",
                           "",
                           "Serious",
                           "",
                           "",
                           "",
                           "Deadly",
                        ][i]}
                     </h4>
                  </div>
               {/if}
            </div>
         {/each}

         <div class="damage-control">
            <div class="overflow-button">
               <i
                  class="fa-solid fa-plus"
                  role="button"
                  tabindex="0"
                  aria-label="Increase overflow"
                  onclick={incrementOverflow}
                  onkeydown={(e) => handleButtonKeypress(e, incrementOverflow)}
               ></i>
            </div>
         </div>

         <div class="damage-control">
            <div class="overflow-button">
               <i
                  class="fa-solid fa-minus"
                  role="button"
                  tabindex="0"
                  aria-label="Decrease overflow"
                  onclick={decrementOverflow}
                  onkeydown={(e) => handleButtonKeypress(e, decrementOverflow)}
               ></i>
            </div>
         </div>
      </div>
   </div>

   <div class="health-card-container">
      <div class="stat-grid single-column">
         <StatCard
            {actor}
            value={$penalty}
            label={localize(config.health.penalty)}
         />
         <StatCard
            {actor}
            value={$overflow}
            label={localize(config.health.overflow)}
         />
      </div>
   </div>
</div>
