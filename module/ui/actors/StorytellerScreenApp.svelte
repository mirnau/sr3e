<script lang="ts">
  import KarmaManager from "./storyteller-screen/KarmaManager.svelte";
  let { actor }: { actor: Actor } = $props();
</script>

<div class="storyteller-screen">
  <div class="storyteller-screen__panel">
    <KarmaManager {actor} />
  </div>
</div>
