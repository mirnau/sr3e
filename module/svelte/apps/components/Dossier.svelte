<script>
  import { slide } from "svelte/transition";
  import { getActorStore } from "../../stores/actorStoreRegistry";
  import { openFilePicker, localize } from "../../../svelteHelpers.js";
  import CardToolbar from "./CardToolbar.svelte";
  import { createEventDispatcher } from "svelte";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();

  let system = $state(actor.system);
  let actorStore = $derived(
    actor.id && actor.name ? getActorStore(actor.id, actor.name) : null,
  );
  let actorName = $state(actor.name);
  let isDetailsOpen = $state(actor.system.profile.isDetailsOpen);
  let imgPath = $state("")
  

  $effect(() => {
    const metahuman = actor.items.find((i) => i.type === "metahuman");
    console.log("Metahuman", metahuman);
    console.log("Metahuman src", metahuman.img);
    imgPath = metahuman.img;
  });

  $effect(() => {
    if (!actorStore) return;

    const unsubscribe = actorStore.subscribe((store) => {
      if (store?.name !== undefined) actorName = store.name;
      if (store?.isDetailsOpen !== undefined)
        isDetailsOpen = store.isDetailsOpen;
    });
    return () => unsubscribe();
  });

  const dispatch = createEventDispatcher();
  function toggleDetails() {
    isDetailsOpen = !isDetailsOpen;
    actor?.update?.(
      { "system.profile.isDetailsOpen": isDetailsOpen },
      { render: false },
    );
    actorStore?.update?.((store) => ({ ...store, isDetailsOpen }));
    dispatch("masonry-reflow");
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
    actorName = newName;
    actorStore?.update?.((store) => ({ ...store, name: newName }));
  }
</script>

<CardToolbar {id} />

<div class="dossier">
  {#if isDetailsOpen}
    <div class="version-one image-mask">
      <img role="presentation" alt={"metaTypeName"} src={imgPath} />
    </div>
  {:else}
    <div class="version-two image-mask">
      <img
        src={actor.img}
        role="presentation"
        alt={actor.name + "!"}
        title={actor.name}
        data-edit="img"
        onclick={() => openFilePicker(actor)}
      />
    </div>
  {/if}

  <div class="dossier-details">
    <div
      class="details-foldout"
      role="button"
      tabindex="0"
      onclick={toggleDetails}
      onkeydown={(e) =>
        ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleDetails())}
    >
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
            value={actorName}
            oninput={(e) => updateStoreName(e.target.value)}
            onblur={saveActorName}
            onkeypress={(e) => e.key === "Enter" && saveActorName(e)}
          />
        </div>
      </div>
    {/if}
  </div>
</div>
