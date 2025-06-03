<script>
    import AttributePointsState from "./AttributePointsState.svelte";
    import SkillPointsState from "./SkillPointsState.svelte";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";

    let { actor = {}, config = {} } = $props();

    let isAssigningAttributesStore = getActorStore(
        actor.id,
        stores.isAssigningAttributes,
        actor.getFlag(flags.sr3e, flags.actor.isAssigningAttributes),
    );

    let isCharacterCreation = $state(
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );
</script>

{#if isCharacterCreation}
    <div>
        {#if $isAssigningAttributesStore}
            <AttributePointsState {actor} {config} />
        {:else}
            <SkillPointsState {actor} {config} bind:isCharacterCreation />
        {/if}
    </div>
{/if}
