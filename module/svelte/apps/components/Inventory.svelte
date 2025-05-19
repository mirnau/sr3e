<script>
    import { localize } from "../../../svelteHelpers.js";
    import  CardToolbar from "./CardToolbar.svelte";
    let { actor = {}, config = {}, id = {}, span = {} } = $props();

</script>

<CardToolbar {id} />

<div class="inventory">
            <h1>{localize(config.inventory.inventory)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>