<script>
    import { localize } from "../../../svelteHelpers.js";
    import CardToolbar from "./CardToolbar.svelte";
    
    let { actor = {}, config = {}, id = {} } = $props();

</script>

<CardToolbar {id} />

<div class="health">
            <h1>{localize(config.health.health)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>