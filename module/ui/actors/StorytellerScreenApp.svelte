<script lang="ts">
  import KarmaManager from "./storyteller-screen/KarmaManager.svelte";
  import TimeManager from "./storyteller-screen/TimeManager.svelte";
  let { actor }: { actor: Actor } = $props();
</script>

<div class="storyteller-screen">
  <div class="storyteller-screen__panel">
    <KarmaManager {actor} />
  </div>
  <div class="storyteller-screen__panel">
    <TimeManager />
  </div>
</div>
