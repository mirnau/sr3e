<script lang="ts">
	import { CreationPointsService } from "../../../services/character-creation/CreationPointsService";
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";
	import CreationPointList from "../../common-components/CreationPointList.svelte";

	const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const creationPointsStore = storeManager.GetRWStore<number>(actor, "creation.attributePoints");
	const intelligenceStore = storeManager.GetRWStore<number>(actor, "attributes.intelligence.value");
	const attributeLocked = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
		false,
	);

	const pointsService = CreationPointsService.Instance();

	// Knowledge and language pools are Int-derived — react to both points and intelligence changes.
	const pointList = $derived(() => {
		$intelligenceStore; // re-run when intelligence changes (knowledge/language pools update)
		return [
			{
				value: $creationPointsStore ?? 0,
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
		const attrPoints = $creationPointsStore ?? 0;
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
