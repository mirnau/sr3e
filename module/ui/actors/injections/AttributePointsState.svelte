<script lang="ts">
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { FLAGS } from "../../../constants/flags";
	import CreationPointList from "../../common-components/CreationPointList.svelte";

	const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const creationPointsStore = storeManager.GetRWStore<number>(actor, "creation.attributePoints");
	const activePoints = storeManager.GetRWStore<number>(actor, "creation.activePoints");
	const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
	const languagePoints = storeManager.GetRWStore<number>(actor, "creation.languagePoints");
	const intelligenceStore = storeManager.GetRWStore<number>(actor, "attributes.intelligence.value");
	const attributeLocked = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
		false,
	);

	const pointList = $derived(() => [
		{
			value: $creationPointsStore ?? 0,
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
					const finalInt = $intelligenceStore ?? 1;
					$knowledgePoints = finalInt * 5;
					$languagePoints = Math.floor(finalInt * 1.5);
					await attributeLocked.update(() => true);
				}
			})();
		}
	});
</script>

<CreationPointList points={pointList()} containerCSS="attribute-point-assignment" />
