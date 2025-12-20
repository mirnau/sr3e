<script lang="ts">
	import AttributePointsState from "./AttributePointsState.svelte";
	import SkillPointsState from "./SkillPointsState.svelte";
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";

	const { actor } = $props<{ actor: Actor }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

	const attributeAssignmentLocked = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
		false,
	);
	const isCharacterCreation = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.IS_CHARACTER_CREATION,
		false,
	);
</script>

{#if $isCharacterCreation}
	<div class="character-creation-manager">
		{#if $attributeAssignmentLocked}
			<SkillPointsState {actor} />
		{:else}
			<AttributePointsState {actor} />
		{/if}
	</div>
{/if}

<style>
	.character-creation-manager {
		margin-bottom: 12px;
	}
</style>
