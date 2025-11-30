<script>
   import ActiveEffectsViewer from "../ActiveEffects/ActiveEffectsViewer.svelte";
   let { actor, config } = $props();
</script>

<ActiveEffectsViewer document={actor} {config} />
