<script lang="ts">
	import { StoreManager } from "../../../utilities/StoreManager.svelte";
	import type { IStoreManager } from "../../../utilities/IStoreManager";
	import { CreationPointsService } from "../../../services/character-creation/CreationPointsService";
	import { FLAGS } from "../../../constants/flags";
	import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";

	const { actor } = $props<{ actor: Actor }>();
	const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
	const isCharacterCreation = storeManager.GetFlagStore(
		actor,
		FLAGS.ACTOR.IS_CHARACTER_CREATION,
		false,
	);
	const isShoppingState = storeManager.GetFlagStore(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false);

	async function handleToggle() {
		if ($isCharacterCreation) {
			await terminateCreation();
			return;
		}
		if ($isShoppingState) {
			// Turning OFF: commit staged attr changes, then deactivate
			KarmaSpendingService.Instance().commitAttrSession(actor);
			await isShoppingState.set(false);
		} else {
			// Turning ON: snapshot attrs, then activate
			KarmaSpendingService.Instance().startAttrSession(actor);
			await isShoppingState.set(true);
		}
	}

	async function terminateCreation() {
		const service = CreationPointsService.Instance();
		const hasUnspentPoints = service.hasUnspentPoints(actor);

		if (hasUnspentPoints) {
			const confirmed = await showWarningDialog();
			if (!confirmed) return;
		}

		// Clear creation flag
		await isCharacterCreation.update(() => false);
		ui.notifications?.info("Character creation complete!");
	}

	async function showWarningDialog(): Promise<boolean> {
		const service = CreationPointsService.Instance();
		const attrPoints = service.getRemainingAttributePoints(actor);
		const activePoints = service.getRemainingSkillPoints(actor, "active");
		const knowledgePoints = service.getRemainingSkillPoints(actor, "knowledge");
		const languagePoints = service.getRemainingSkillPoints(actor, "language");

		return Dialog.confirm({
			title: "Finish Character Creation?",
			content: `
				<p>You have unspent creation points:</p>
				<ul>
					${attrPoints > 0 ? `<li>Attribute points: ${attrPoints}</li>` : ""}
					${activePoints > 0 ? `<li>Active skill points: ${activePoints}</li>` : ""}
					${knowledgePoints > 0 ? `<li>Knowledge skill points: ${knowledgePoints}</li>` : ""}
					${languagePoints > 0 ? `<li>Language skill points: ${languagePoints}</li>` : ""}
				</ul>
				<p>These will be discarded. Are you sure?</p>
			`,
		});
	}
</script>

<button
	type="button"
	class="header-control icon fa-solid fa-cart-shopping {$isShoppingState || $isCharacterCreation
		? 'pulsing-green-cart'
		: ''}"
	onclick={handleToggle}
	title={$isCharacterCreation ? "Finish Character Creation" : "Toggle Shopping Mode"}
	aria-label={$isCharacterCreation ? "Finish Character Creation" : "Toggle Shopping Mode"}
></button>
