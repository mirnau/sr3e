<script lang="ts">
  import { toggleCardSpanById, moveCardById } from "../../../svelteHelpers.js";

  const { id } = $props();

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
  <button aria-label="Move card up" onclick={() => handleMove("up")}>
    <i class="fa-solid fa-arrow-up"></i>
  </button>
  <button aria-label="Move card down" onclick={() => handleMove("down")}>
    <i class="fa-solid fa-arrow-down"></i>
  </button>
  <button aria-label="Toggle card span" onclick={handleToggleSpan}>
    <i class="fa-solid fa-expand-arrows-alt"></i>
  </button>
</div>
