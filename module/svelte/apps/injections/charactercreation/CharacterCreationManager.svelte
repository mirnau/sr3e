<script>
    import AttributePointsState from "./AttributePointsState.svelte";
    import SkillPointsState from "./SkillPointsState.svelte";
    import { flags } from "../../../../foundry/services/commonConsts.js";

    let { actor = {}, config = {} } = $props();
    let isAssigningAttributes = $state(
        actor.getFlag(flags.sr3e, flags.actor.isAssigningAttributes),
    );
    let isCharacterCreation = $state(
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );
</script>

{#if isCharacterCreation}
    <div>
        {#if isAssigningAttributes}
            <AttributePointsState {actor} {config} bind:isAssigningAttributes />
        {:else}
            <SkillPointsState {actor} {config} bind:isCharacterCreation />
        {/if}
    </div>
{/if}
