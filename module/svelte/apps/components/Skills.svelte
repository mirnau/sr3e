<script>
    import { localize } from "../../../foundry/SvelteHelpers.js";
    let { actor = {}, config = {} } = $props();
</script>
<div class="skills">
            <h1>{localize(config.skills.skills)}</h1>
            <span>{actor.system.profile.metaHumanity ?? "Fluffy Dog Lasagna"}</span>
</div>