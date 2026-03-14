<script lang="ts">
import { onDestroy } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { ElectroCardiogramService } from "../../../services/health/ElectroCardiogramService";
import type SR3EActor from "../../../documents/SR3EActor";
import StatCard from "./StatCard.svelte";

let { actor }: { actor: SR3EActor } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

storeManager.Subscribe(actor);
const stun = storeManager.GetRWStore<number>(actor, "health.stun.value");
const physical = storeManager.GetRWStore<number>(actor, "health.physical.value");
const penalty = storeManager.GetRWStore<number>(actor, "health.penalty.value");
const overflow = storeManager.GetRWStore<number>(actor, "health.overflow.value");
const miraculousSurvival = storeManager.GetFlagStore<boolean>(actor, "miraculousSurvival", false);
const isAlive = storeManager.GetRWStore<boolean>(actor, "health.isAlive");

let ecgCanvas = $state<HTMLCanvasElement | null>(null);
let ecgPointCanvas = $state<HTMLCanvasElement | null>(null);
let ecgContainer = $state<HTMLElement | null>(null);
let ecgService = $state<ElectroCardiogramService | null>(null);

const stunBoxes = $derived(Array.from({ length: 10 }, (_, i) => i < $stun));
const physicalBoxes = $derived(Array.from({ length: 10 }, (_, i) => i < $physical));

const localization = $derived(CONFIG.SR3E.HEALTH);
const severityLabels = ["light", "medium", "serious", "deadly"];
const severityIndices = [0, 2, 5, 9];

$effect(() => {
   if (ecgCanvas && ecgPointCanvas && ecgContainer && !ecgService) {
      ecgService = new ElectroCardiogramService(
         ecgCanvas,
         ecgPointCanvas,
         ecgContainer
      );
   }
});
$effect(() => {
   if (!ecgService) return;

   if (!$isAlive) {
      ecgService.flatline();
   } else {
      ecgService.resume();
   }
});
$effect(() => {
   if ($overflow > 0) {
      if ($stun < 10) stun.set(10);
      if ($physical < 10) physical.set(10);
   }
});
$effect(() => {
   if (!ecgService) return;
   const calculatedPenalty = ecgService.calculatePenalty($stun, $physical);
   penalty.set(calculatedPenalty);
});
onDestroy(() => {
   storeManager.Unsubscribe(actor);
   ecgService?.destroy();
});

function toggle(localIndex: number, isStun: boolean, willBeChecked: boolean) {
   const newValue = willBeChecked ? localIndex + 1 : localIndex;
   if (isStun) {
      stun.set(newValue);
   } else {
      physical.set(newValue);
   }
}

function incrementOverflow() {
   overflow.set(Math.min($overflow + 1, 10));
}

function decrementOverflow() {
   overflow.set(Math.max($overflow - 1, 0));
}

async function revive() {
   const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize(localization?.miraculousSurvival) },
      content: `<p>${localize(localization?.reviveConfirm)}</p>`,
      yes: { label: localize(localization?.revive) },
      no: { label: "Cancel" }
   });

   if (confirmed) {
      overflow.set(0);
      isAlive.set(true);
      miraculousSurvival.set(true);
   }
}

function handleButtonKeypress(e: KeyboardEvent, fn: () => void) {
   if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
   }
}
</script>

<div bind:this={ecgContainer} class="ecg-container">
      <div class="ecg-viewport">
         <canvas bind:this={ecgCanvas} id="ecg-canvas" class="ecg-animation"></canvas>
         <canvas bind:this={ecgPointCanvas} id="ecg-point-canvas"></canvas>
         <div class="left-gradient"></div>
         <div class="right-gradient"></div>
      </div>
   </div>

   <div class="condition-monitor">
      <div class="condition-meter">
         <i
            class={`fa-solid fa-heart-circle-bolt miraculous-survival-icon${$miraculousSurvival ? " used" : ""}`}
            role="button"
            tabindex={$miraculousSurvival ? -1 : 0}
            aria-label="Revive"
            aria-disabled={$miraculousSurvival}
            onclick={!$miraculousSurvival ? revive : undefined}
            onkeydown={!$miraculousSurvival ? (e) => handleButtonKeypress(e, revive) : undefined}
         ></i>
<div class="stun-damage">
            <h3 class="no-margin checkbox-label">{localize(localization?.stun)}</h3>
            {#each stunBoxes as checked, i}
               <div class="damage-input">
                  <input
                     class="checkbox"
                     type="checkbox"
                     id={`healthBox${i + 1}`}
                     {checked}
                     onchange={(e) => toggle(i, true, (e.target as HTMLInputElement).checked)}
                  />
                  {#if severityIndices.includes(i)}
                     <div class="damage-description stun">
                        <h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
                           {localize(localization?.[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization] || "")}
                        </h4>
                     </div>
                  {/if}
               </div>
            {/each}
         </div>
<div class="physical-damage">
            <h3 class="no-margin checkbox-label">{localize(localization?.physical)}</h3>
            {#each physicalBoxes as checked, i}
               <div class="damage-input">
                  <input
                     class="checkbox"
                     type="checkbox"
                     id={`healthBox${i + 11}`}
                     {checked}
                     onchange={(e) => toggle(i, false, (e.target as HTMLInputElement).checked)}
                  />
                  {#if severityIndices.includes(i)}
                     <div class="damage-description physical">
                        <h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
                           {localize(localization?.[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization] || "")}
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
<div class="stat-card-grid health-stat-cards">
         <StatCard label={localize(localization?.penalty)}>
            <span class="attribute-value">{$penalty}</span>
         </StatCard>
         <StatCard label={localize(localization?.overflow)}>
            <span class="attribute-value">{$overflow}</span>
         </StatCard>
      </div>
   </div>
