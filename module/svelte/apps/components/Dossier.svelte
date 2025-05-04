<script>
  import { slide } from "svelte/transition";
  import { getActorStore } from "../../stores/actorStoreRegistry";
  import { openFilePicker, localize } from "../../../foundry/SvelteHelpers.js";

  let { actor = {}, config = {} } = $props();

  let actorStore = $derived(
    actor?.id && actor?.name ? getActorStore(actor.id, actor.name) : null
  );

  let fieldName = $state(actor?.name ?? "");
  let isDetailsOpen = $state(actor?.system?.profile?.isDetailsOpen ?? false);

  $effect(() => {
    if (!actorStore) return;

    const unsubscribe = actorStore.subscribe((store) => {
      if (store?.name !== undefined) fieldName = store.name;
      if (store?.isDetailsOpen !== undefined) isDetailsOpen = store.isDetailsOpen;
    });
    return () => unsubscribe();
  });

  function toggleDetails() {
    isDetailsOpen = !isDetailsOpen;
    actor?.update?.({ "system.profile.isDetailsOpen": isDetailsOpen }, { render: false });
    actorStore?.update?.((store) => ({ ...store, isDetailsOpen }));
  }

  function handleFilePicker() {
    openFilePicker(actor);
  }

  function saveActorName(event) {
    const newName = event.target.value;
    actor?.update?.({ name: newName }, { render: true });
    actorStore?.update?.((store) => ({ ...store, name: newName }));
  }

  function multiply(value, factor) {
    return (value * factor).toFixed(2);
  }

  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function updateStoreName(newName) {
    fieldName = newName;
    actorStore?.update?.((store) => ({ ...store, name: newName }));
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
        alt={actor.name + "!"}
        title={actor.name}
        data-edit="img"
        onclick={handleFilePicker}
      />
    </div>
  {/if}

  <div class="dossier-details">
    <div class="details-foldout" onclick={toggleDetails}>
      <span><i class="fa-solid fa-magnifying-glass"></i></span>
      {localize(config.sheet.details)}
    </div>

    {#if isDetailsOpen}
      <div
        in:slide={{ duration: 400, easing: cubicInOut }}
        out:slide={{ duration: 300, easing: cubicInOut }}
      >
        <div>
          <input
            type="text"
            id="actor-name"
            name="name"
            value={fieldName}
            oninput={(e) => updateStoreName(e.target.value)}
            onblur={saveActorName}
            onkeypress={(e) => e.key === "Enter" && saveActorName(e)}
          />
        </div>

        <div>
          <h3>
            {localize(config.traits.metahuman)}:
            <span>{actor.system?.profile?.metaHumanity ?? ""}</span>
          </h3>
        </div>

        <div>
          <h3>
            {localize(config.traits.age)}: {actor.system?.profile?.age ?? ""}
          </h3>
        </div>

        <div>
          <h3>
            {localize(config.traits.height)}: {actor.system?.profile?.height ?? ""} cm ({multiply(
              actor.system?.profile?.height ?? 0,
              0.0328084
            )} feet)
          </h3>
        </div>

        <div>
          <h3>
            {localize(config.traits.weight)}: {actor.system?.profile?.weight ?? ""} kg ({multiply(
              actor.system?.profile?.weight ?? 0,
              0.157473
            )} stones)
          </h3>
        </div>

        <a class="journal-entry-link">
          <h3>{localize(config.sheet.viewbackground)}</h3>
        </a>
      </div>
    {/if}
  </div>
</div>
