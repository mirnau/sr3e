<script lang="ts">
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import SkillsActive from "./skills/SkillsActive.svelte";
import SkillsKnowledge from "./skills/SkillsKnowledge.svelte";
import SkillsLanguage from "./skills/SkillsLanguage.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let itemsUpdateTick = $state(0);

// Tab state
let activeTab = $state<"active" | "knowledge" | "language">("active");

$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Setup item collection listeners (pattern from DicePools.svelte)
	const collection = actor.items?.collection;
	const bump = () => (itemsUpdateTick = itemsUpdateTick + 1);

	if (collection) {
		collection.on("update", bump);
		collection.on("create", bump);
		collection.on("delete", bump);
	}

	const bumpHook = (doc: Record<string, unknown>) => {
		if ((doc?.parent as Record<string, unknown> | undefined)?.id === actor?.id) bump();
	};

	Hooks.on("updateItem", bumpHook);
	Hooks.on("createItem", bumpHook);
	Hooks.on("deleteItem", bumpHook);

	return () => {
		if (collection) {
			collection.off("update", bump);
			collection.off("create", bump);
			collection.off("delete", bump);
		}
		Hooks.off("updateItem", bumpHook);
		Hooks.off("createItem", bumpHook);
		Hooks.off("deleteItem", bumpHook);
		storeManager.Unsubscribe(actor);
	};
});

// Derived skill collections — re-derive on every itemsUpdateTick
const activeSkills = $derived(
	itemsUpdateTick >= 0
		? [...(actor?.items ?? [])]
			.filter((item: Record<string, unknown>) => {
				const sys = item.system as Record<string, unknown>;
				return item.type === "skill" && sys?.skillType === "active";
			})
			.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
				(a.name as string).localeCompare(b.name as string)
			)
		: []
);

const knowledgeSkills = $derived(
	itemsUpdateTick >= 0
		? [...(actor?.items ?? [])]
			.filter((item: Record<string, unknown>) => {
				const sys = item.system as Record<string, unknown>;
				return item.type === "skill" && sys?.skillType === "knowledge";
			})
			.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
				(a.name as string).localeCompare(b.name as string)
			)
		: []
);

const languageSkills = $derived(
	itemsUpdateTick >= 0
		? [...(actor?.items ?? [])]
			.filter((item: Record<string, unknown>) => {
				const sys = item.system as Record<string, unknown>;
				return item.type === "skill" && sys?.skillType === "language";
			})
			.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
				(a.name as string).localeCompare(b.name as string)
			)
		: []
);

</script>

{#if actor}
	<h1>Skills</h1>
	<div class="skills-tabs">
		<div class="skills-tab-buttons">
			<button
				type="button"
				class="skills-tab-btn"
				class:active={activeTab === "active"}
				onclick={() => (activeTab = "active")}
			>
				Active
			</button>
			<button
				type="button"
				class="skills-tab-btn"
				class:active={activeTab === "knowledge"}
				onclick={() => (activeTab = "knowledge")}
			>
				Knowledge
			</button>
			<button
				type="button"
				class="skills-tab-btn"
				class:active={activeTab === "language"}
				onclick={() => (activeTab = "language")}
			>
				Language
			</button>
		</div>
		<div class="skills-tab-content">
			{#if activeTab === "active"}
				<SkillsActive {actor} skills={activeSkills} />
			{:else if activeTab === "knowledge"}
				<SkillsKnowledge {actor} skills={knowledgeSkills} />
			{:else}
				<SkillsLanguage {actor} skills={languageSkills} />
			{/if}
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Skills.</p>
{/if}
