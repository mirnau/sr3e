<script>
  import { onMount } from "svelte";
  import { localize } from "../../../services/utilities.js";
  import CardToolbar from "./CardToolbar.svelte";
  import { getActorStore, stores } from "../../stores/actorStores.js";
  import ElectroCardiogramService from "../../../services/ElectroCardiogramService.js";
  import StatCard from "./basic/StatCard.svelte";

  let { actor = {}, config = {}, id = {} } = $props();

  let stunArray = getActorStore(
    actor.id,
    stores.combat.stunDamage,
    foundry.utils.deepClone(actor.system.health.stun)
  );

  let physicalArray = getActorStore(
    actor.id,
    stores.combat.leathalDamage,
    foundry.utils.deepClone(actor.system.health.physical)
  );

  let penalty = getActorStore(
    actor.id,
    stores.penalty,
    actor.system.health.penalty ?? 0
  );

  let overflow = getActorStore(
    actor.id,
    stores.overflow,
    actor.system.health.overflow ?? 0
  );

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

    maxDegree = Math.max(
      $stunArray.filter(Boolean).length,
      $physicalArray.filter(Boolean).length
    );
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
      <!-- svelte-ignore a11y_missing_attribute -->
      <a
        class="overflow-button plus"
        role="button"
        tabindex="0"
        aria-label="Increase overflow"
      >
        <i class="fa-solid fa-plus"></i>
      </a>
      <a
        class="overflow-button minus"
        role="button"
        tabindex="0"
        aria-label="Decrease overflow"
      >
        <i class="fa-solid fa-minus"></i>
      </a>
    </div>
  </div>
  <div class="health-card-container">
    <div class="stat-grid single-column">
      <StatCard value={$penalty} label={localize(config.health.penalty)} />
      <StatCard value={$overflow} label={localize(config.health.overflow)} />
    </div>
  </div>
</div>
