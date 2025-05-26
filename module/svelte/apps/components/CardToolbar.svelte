<script lang="ts">
  import { toggleCardSpanById, moveCardById } from "../../../svelteHelpers.js";
  import {
    addStatCard,
    removeStatCard,
    moveSheetComponent
  } from "../../../foundry/factories/componentFactory.js";

  const { id, doc } = $props();

  const isItem = doc.type === "item";

  function handleMove(direction: "up" | "down") {
    console.log("handle move called");
    moveCardById(id, direction);
  }

  function handleToggleSpan() {
    toggleCardSpanById(id);
  }
</script>

<div
  class="toolbar"
  role="toolbar"
  tabindex="0"
  onclick={(e) => e.stopPropagation()}
  onkeydown={(e) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  }}
>
  {#if isItem}
    <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Delete card"
      onclick={() => addStatCard(doc, id)}
    >
      <i class="fa-solid fa-plus"></i>
    </button>
  {/if}

  <button
    class="header-control icon sr3e-toolbar-button"
    aria-label="Move card up"
    onclick={async() => await moveSheetComponent(doc, id, "up")}
  >
    <i class="fa-solid fa-arrow-up"></i>
  </button>
  <button
    class="header-control icon sr3e-toolbar-button"
    aria-label="Move card down"
       onclick={async() => await moveSheetComponent(doc, id, "down")}
  >
    <i class="fa-solid fa-arrow-down"></i>
  </button>
  <button
    class="header-control icon sr3e-toolbar-button"
    aria-label="Toggle card span"
    onclick={handleToggleSpan}
  >
    <i class="fa-solid fa-arrows-spin"></i>
  </button>
  {#if isItem}
    <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Delete card"
      onclick={async () => await removeStatCard(doc, id)}
    >
      <i class="fa-solid fa-trash-can"></i>
    </button>
  {/if}
</div>
