<script>
    import { localize } from "../../../foundry/SvelteHelpers.js";
    let { actor = {}, config = {} } = $props();
</script>
<div class="attributes">
            <h1>{localize(config.attributes.attributes)}</h1>
            <h2>{localize(config.attributes.attributes)}</h2>
            <h3>{localize(config.attributes.attributes)}</h3>
            <h4>{localize(config.attributes.attributes)}</h4>
            <p>{localize(config.attributes.attributes)}</p>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>