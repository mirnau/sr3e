<script lang="ts">
   import { toggleCardSpanById, moveCardById } from "@services/utilities.js";

   const { id } = $props();

   function handleMove(direction) {
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
   <button
      class="header-control icon sr3e-toolbar-button fa-solid fa-arrow-up"
      aria-label="Move card up"
      onclick={() => handleMove("up")}
   ></button>
   <button
      class="header-control icon sr3e-toolbar-button fa-solid fa-arrow-down"
      aria-label="Move card down"
      onclick={() => handleMove("down")}
   ></button>
   <button
      class="header-control icon sr3e-toolbar-button fa-solid fa-arrows-spin"
      aria-label="Toggle card span"
      onclick={handleToggleSpan}
   ></button>
</div>
