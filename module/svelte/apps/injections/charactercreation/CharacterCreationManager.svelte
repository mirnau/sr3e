<script>
    import AttributePointsState from "./AttributePointsState.svelte";
    import SkillPointsState from "./SkillPointsState.svelte";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";

    let { actor = {}, config = {} } = $props();

    let attributeAssignmentLocked = getActorStore(
        actor.id,
        stores.attributeAssignmentLocked,
        actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked),
    );
    console.log("attributeAssignmentLocked", $attributeAssignmentLocked);

    let isCharacterCreation = getActorStore(
        actor.id,
        stores.isCharacterCreation,
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );
</script>

{#if $isCharacterCreation}
    <div>
        {#if $attributeAssignmentLocked}
            <SkillPointsState {actor} {config} />
        {:else}
            <AttributePointsState {actor} {config} />
        {/if}
    </div>
{/if}
