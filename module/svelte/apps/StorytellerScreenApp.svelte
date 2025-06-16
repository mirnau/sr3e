<script>
    import TimeManager from "./components/TimeManager.svelte";
    let { actor = {}, config = {} } = $props();
</script>

<div>
    <TimeManager {config} />
</div>
