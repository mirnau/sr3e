<script lang="ts">
  import KarmaManager from "./storyteller-screen/KarmaManager.svelte";
  import TimeManager from "./storyteller-screen/TimeManager.svelte";
</script>

<div class="storyteller-screen">
  <div class="storyteller-screen__panel storyteller-screen__panel--primary">
    <KarmaManager />
  </div>
  <div class="storyteller-screen__panel">
    <TimeManager />
  </div>
</div>
