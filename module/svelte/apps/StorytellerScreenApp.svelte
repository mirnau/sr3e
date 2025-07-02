<script>
    import TimeManager from "./components/TimeManager.svelte";
    import KarmaManager from "./components/KarmaManager/KarmaManager.svelte";
    import DicePoolManager from "./components/DicePoolManager/DicePoolManager.svelte";
    let { actor = {}, config = {} } = $props();
</script>

<div>
    <TimeManager {config} />
    <KarmaManager {config}  />
    <DicePoolManager {config} />
</div>
