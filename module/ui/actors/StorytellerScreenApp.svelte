<script lang="ts">
  let { actor }: { actor: Actor } = $props();
</script>

<div class="storyteller-screen">
  <div class="storyteller-screen__panel">
    <!-- KarmaManager will be added in plan 02 -->
  </div>
</div>

<style>
  .storyteller-screen {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 8px;
  }
  .storyteller-screen__panel {
    border-radius: 4px;
    padding: 8px;
  }
</style>
