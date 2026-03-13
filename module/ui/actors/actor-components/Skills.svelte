<script lang="ts">
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import SkillsActive from "./skills/SkillsActive.svelte";
import SkillsKnowledge from "./skills/SkillsKnowledge.svelte";
import SkillsLanguage from "./skills/SkillsLanguage.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let itemsUpdateTick = $state(0);

// Tab state — shallow store survives sheet re-renders (Foundry remounts on every actor update)
let activeTabStore = $state<Writable<"active" | "knowledge" | "language"> | null>(null);

$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	activeTabStore = storeManager.GetShallowStore<"active" | "knowledge" | "language">(
		actor, "skillsActiveTab", "active"
	);

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
	<div class="skills-component">
		<div class="skills-register">
			<button
				type="button"
				class="skills-register-tab"
				class:active={$activeTabStore === "active"}
				onclick={() => activeTabStore?.set("active")}
			><span>Active</span></button>
			<button
				type="button"
				class="skills-register-tab"
				class:active={$activeTabStore === "knowledge"}
				onclick={() => activeTabStore?.set("knowledge")}
			><span>Knowledge</span></button>
			<button
				type="button"
				class="skills-register-tab"
				class:active={$activeTabStore === "language"}
				onclick={() => activeTabStore?.set("language")}
			><span>Language</span></button>
		</div>
		<div class="skills-content">
			<div class="skills-content-inner">
				{#if $activeTabStore === "active"}
					<SkillsActive {actor} skills={activeSkills} />
				{:else if $activeTabStore === "knowledge"}
					<SkillsKnowledge {actor} skills={knowledgeSkills} />
				{:else}
					<SkillsLanguage {actor} skills={languageSkills} />
				{/if}
			</div>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Skills.</p>
{/if}
