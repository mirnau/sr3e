<script lang="ts">
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";
	import CreationPointList from "../../common-components/CreationPointList.svelte";

	const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const activePoints = storeManager.GetRWStore<number>(actor, "creation.activePoints");
	const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
	const languagePoints = storeManager.GetRWStore<number>(actor, "creation.languagePoints");
	const isCharacterCreation = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.IS_CHARACTER_CREATION,
		false,
	);

	const pointList = $derived(() => [
		{
			value: 0, // Attributes are locked during skill phase
			text: "Attribute Points",
		},
		{
			value: $activePoints ?? 0,
			text: "Active Skills",
		},
		{
			value: $knowledgePoints ?? 0,
			text: "Knowledge Skills",
		},
		{
			value: $languagePoints ?? 0,
			text: "Language Skills",
		},
	]);

	// Auto-prompt when all skill points spent
	$effect(() => {
		if (
			($activePoints ?? 0) === 0 &&
			($knowledgePoints ?? 0) === 0 &&
			($languagePoints ?? 0) === 0 &&
			$isCharacterCreation
		) {
			(async () => {
				const confirmed = await Dialog.confirm({
					title: "Finish Character Creation?",
					content: "<p>You have spent all your skill points.</p><p>Finish character creation?</p>",
				});

				if (confirmed) {
					await isCharacterCreation.update(() => false);
				}
			})();
		}
	});
</script>

<CreationPointList points={pointList()} containerCSS="skill-point-assignment" />
