<script>
    import { localize, toggleCardSpanById } from "../../../svelteHelpers.js";
    let { actor = {}, config = {}, id = {} } = $props();

        function toggleSpan() {
         toggleCardSpanById(id); 
    }

</script>


<div class="toolbar" onclick={(e) => e.stopPropagation()}>
  <button onclick={() => moveCard('up')}><i class="fa-solid fa-arrow-up"></i></button>
  <button onclick={() => moveCard('down')}><i class="fa-solid fa-arrow-down"></i></button>
  <button onclick={toggleSpan}><i class="fa-solid fa-expand-arrows-alt"></i></button>
</div>

<div class="health">
            <h1>{localize(config.health.health)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>