<script lang="ts">
	import { CreationPointsService } from "../../../services/character-creation/CreationPointsService";
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";
	import CreationPointList from "../../common-components/CreationPointList.svelte";

	const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const actorStore = storeManager.GetROStore(actor);
	const isCharacterCreation = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.IS_CHARACTER_CREATION,
		false,
	);

	const pointsService = CreationPointsService.Instance();

	// Create reactive point list (attribute points greyed out, skill points highlighted)
	const pointList = $derived(() => {
		$actorStore; // Trigger reactivity
		return [
			{
				value: 0, // Attributes are locked, show 0
				text: "Attribute Points",
			},
			{
				value: pointsService.getRemainingSkillPoints(actor, "active"),
				text: "Active Skills",
			},
			{
				value: pointsService.getRemainingSkillPoints(actor, "knowledge"),
				text: "Knowledge Skills",
			},
			{
				value: pointsService.getRemainingSkillPoints(actor, "language"),
				text: "Language Skills",
			},
		];
	});

	// Auto-prompt when all skill points spent
	$effect(() => {
		const activePoints = pointsService.getRemainingSkillPoints(actor, "active");
		const knowledgePoints = pointsService.getRemainingSkillPoints(actor, "knowledge");
		const languagePoints = pointsService.getRemainingSkillPoints(actor, "language");

		if (
			activePoints === 0 &&
			knowledgePoints === 0 &&
			languagePoints === 0 &&
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
