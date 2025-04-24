<script>
    import { localize } from "../../../foundry/SvelteHelpers.js";
    let { actor = {}, config = {} } = $props();
</script>
<div class="inventory">
            <h1>{localize(config.inventory.inventory)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>