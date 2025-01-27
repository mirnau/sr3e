<script>
  import { onMount } from "svelte";
  import Log from "../../../../Log";
  export let actor = {};
  export let config = {};

  // Reactive store for isDetailsOpen, synchronized with the actor's flag
  $: isDetailsOpen = actor.system.profile.isDetailsOpen;

  onMount(() => {
    isDetailsOpen = actor.system.profile.isDetailsOpen;
    Log.inspect("Dossier actor", "SVELTE", actor);
  });

  function toggleDetails() {
    actor.update(
      { "system.profile.isDetailsOpen": isDetailsOpen },
      { render: false },
    );
    actor.mainLayoutResizeObserver.masonryInstance.layout();
  }

  function saveActorName(event) {
    const newName = event.target.value;
    actor.update({ name: newName }, { render: true });
  }

  function multiply(value, factor) {
    return (value * factor).toFixed(2);
  }
</script>

<div class="dossier">
  <!-- Reactive rendering based on isDetailsOpen -->
  {#if isDetailsOpen}
    <div class="version-one image-mask">
      <img alt="Metahuman Portrait" />
    </div>
  {:else}
    <div class="version-two image-mask">
      <img
        src={actor.img}
        alt={actor.name}
        title={actor.name}
        data-edit="img"
      />
    </div>
  {/if}

  <details bind:open={isDetailsOpen} on:toggle={toggleDetails}>
    <summary class="details-foldout">
      <span><i class="fa-solid fa-magnifying-glass"></i></span>
      {config.sheet.details}
    </summary>

    <div>
      <!-- Save on blur (when focus leaves input) -->
      <input
        type="text"
        id="actor-name"
        name="name"
        bind:value={actor.name}
        on:blur={saveActorName}
        on:keypress={(e) => e.key === "Enter" && saveActorName(e)}
        />
    </div>

    <div>
      <h3>
        {config.actor.character.metahuman}:
        <span>{actor.system.profile.metaHumanity}</span>
      </h3>
    </div>

    <div>
      <h3>
        {config.actor.character.age}: {actor.system.profile.age}
      </h3>
    </div>

    <div>
      <h3>
        {config.actor.character.height}: {actor.system.profile.height} cm ({multiply(
          actor.system.profile.height,
          0.0328084,
        )} feet)
      </h3>
    </div>

    <div>
      <h3>
        {config.actor.character.weight}: {actor.system.profile.weight} kg ({multiply(
          actor.system.profile.weight,
          0.157473,
        )} stones)
      </h3>
    </div>

    <!-- svelte-ignore a11y_missing_attribute -->
    <a class="journal-entry-link">
      <h3>{config.sheet.viewbackground}</h3>
    </a>
  </details>
</div>
