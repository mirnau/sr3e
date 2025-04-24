<script>
    import { localize } from "../../../foundry/SvelteHelpers.js";
    let { actor = {}, config = {} } = $props();
</script>
<div class="health">
            <h1>{localize(config.health.health)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>