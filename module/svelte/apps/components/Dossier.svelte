<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Log from "../../../../Log";
  import {getActorStore} from "../../stores/actorStoreRegistry";
  export let actor = {};
  export let config = {};

  const actorStore = getActorStore(actor.id, actor.name);
  
  // Access reactive properties of the actor's store
  $: isDetailsOpen = actor.system.profile.isDetailsOpen;
  $: fieldName = $actorStore.name;

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

  // Define the cubicInOut easing function manually
  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function openFilePicker() {
    // Use Foundry's FilePicker API
    new FilePicker({
      type: "image",
      current: actor.img, // current image path
      callback: (path) => {
        // Update the actor's image with the selected path
        actor.update({ img: path }, { render: true });
      },
    }).render(true);
  }

  function updateStoreName(newName) {
    actorStore.update((store) => {
      store.name = newName; // Update the name property in the store
      return store; // Return the updated store value
    });
  }

</script>

<div class="dossier">
  {#if isDetailsOpen}
    <div class="version-one image-mask">
      <img alt="Metahuman Portrait" />
    </div>
  {:else}
    <div class="version-two image-mask">
      <img
        src={actor.img}
        role="presentation"
        alt={actor.name}
        title={actor.name}
        data-edit="img"
        on:click={openFilePicker}
      />
    </div>
  {/if}

  <details
    class="dossier-details"
    bind:open={isDetailsOpen}
    on:toggle={toggleDetails}
  >
    <summary class="details-foldout">
      <span><i class="fa-solid fa-magnifying-glass"></i></span>
      {config.sheet.details}
    </summary>

    {#if isDetailsOpen}
      <div
        in:slide={{ duration: 400, easing: cubicInOut }}
        out:slide={{ duration: 300, easing: cubicInOut }}
      >
        <!-- Save on blur (when focus leaves input) -->
        <div>
          <input
            type="text"
            id="actor-name"
            name="name"
            bind:value={fieldName}
            on:blur={saveActorName}
            on:input={(e) => updateStoreName(e.target.value)} 
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
      </div>
    {/if}
  </details>
</div>
