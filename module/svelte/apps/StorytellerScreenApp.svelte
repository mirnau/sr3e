<script>
    import TimeManager from "./components/TimeManager.svelte";
    import KarmaManager from "./components/KarmaManager.svelte";
    let { actor = {}, config = {} } = $props();
</script>

<div>
    <TimeManager {config} />
    <KarmaManager {config}  />
</div>
