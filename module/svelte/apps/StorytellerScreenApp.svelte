<script>
    import TimeManager from "@sveltecomponent/TimeManager.svelte";
    import KarmaManager from "@sveltecomponent/KarmaManager/KarmaManager.svelte";
    import DicePoolManager from "@sveltecomponent/DicePoolManager/DicePoolManager.svelte";
    let { actor = {}, config = {} } = $props();
</script>

<div>
    <TimeManager {config} />
    <KarmaManager {config}  />
    <DicePoolManager {config} />
</div>
