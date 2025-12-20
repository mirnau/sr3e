<script lang="ts">
	import { CreationPointsService } from "../../../services/character-creation/CreationPointsService";
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";
	import CreationPointList from "../../common-components/CreationPointList.svelte";

	const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const actorStore = storeManager.GetROStore(actor);
	const attributeLocked = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
		false,
	);

	const pointsService = CreationPointsService.Instance();

	// Create reactive point list
	const pointList = $derived(() => {
		$actorStore; // Trigger reactivity
		return [
			{
				value: pointsService.getRemainingAttributePoints(actor),
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

	// Auto-prompt when attribute points reach 0
	$effect(() => {
		const attrPoints = pointsService.getRemainingAttributePoints(actor);
		if (attrPoints === 0 && !$attributeLocked) {
			(async () => {
				const confirmed = await Dialog.confirm({
					title: "Complete Attribute Assignment?",
					content:
						"<p>You have spent all your attribute points.</p><p>Lock attributes and proceed to skill assignment?</p>",
				});

				if (confirmed) {
					await attributeLocked.update(() => true);
				}
			})();
		}
	});
</script>

<CreationPointList points={pointList()} containerCSS="attribute-point-assignment" />
