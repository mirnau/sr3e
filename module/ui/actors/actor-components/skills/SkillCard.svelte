<script lang="ts">
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../../utilities/IStoreManager";
import { StoreManager } from "../../../../utilities/StoreManager.svelte";
import SkillEditorApp from "../../../../sheets/items/SkillEditorApp";

interface Props {
	actor: Actor | null;
	item: Item;
	category: "active" | "knowledge" | "language";
}

let { actor = null, item, category }: Props = $props();

const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

type Specialization = { name: string; value: number };

const skillKey = `${category}Skill`;

let valueStore = $state<Writable<number> | null>(null);
let specializationsStore = $state<Writable<Specialization[]> | null>(null);
let readWriteStore = $state<Writable<number> | null>(null);
let isShoppingState = $state<Writable<boolean> | null>(null);
let isCharacterCreation = $state<Writable<boolean> | null>(null);

$effect(() => {
	storeManager.Subscribe(item);
	valueStore = storeManager.GetRWStore<number>(item, `${skillKey}.value`);
	specializationsStore = storeManager.GetRWStore<Specialization[]>(item, `${skillKey}.specializations`);

	if (category === "language") {
		readWriteStore = storeManager.GetRWStore<number>(item, "languageSkill.readwrite.value");
	}

	if (actor) {
		storeManager.Subscribe(actor);
		isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
		isCharacterCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);
	}

	return () => {
		storeManager.Unsubscribe(item);
		if (actor) storeManager.Unsubscribe(actor);
	};
});

function openSkillEditor(): void {
	if (!actor) return;
	SkillEditorApp.launch(actor, item, category);
}

// Roll placeholder — Phase 3 will implement full roll logic
function rollSkill(e: MouseEvent | KeyboardEvent): void {
	e.preventDefault();
	// TODO Phase 3: roll implementation
}

function rollSpec(e: MouseEvent | KeyboardEvent, _spec: Specialization): void {
	e.preventDefault();
	// TODO Phase 3: specialization roll
}

function capitalize(s: string): string {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

const linkedAttrName =
	category === "active"
		? capitalize((item.system as Record<string, any>)?.activeSkill?.linkedAttribute ?? "")
		: "Intelligence";
</script>

<div class="skill-card-container" data-item-id={item.id}>
	{#if (isShoppingState && $isShoppingState) || (isCharacterCreation && $isCharacterCreation)}
		<i
			class="header-control icon fa-solid fa-pen-to-square pulsing-green-cart"
			tabindex="0"
			role="button"
			aria-label="Edit skill"
			onclick={openSkillEditor}
			onkeydown={(e) => e.key === "Enter" && openSkillEditor()}
		></i>
		<div class="skill-card">
			<div class="skill-background-layer"></div>
			<h6 class="no-margin skill-name" title={item.name}>{item.name}</h6>
			<h5 class="no-margin">({linkedAttrName})</h5>
			<div class="skill-main-container">
				<h1 class="skill-value">{valueStore ? $valueStore : 0}</h1>
			</div>
			{#if specializationsStore && ($specializationsStore?.length ?? 0) > 0}
				<div class="specialization-container">
					{#each ($specializationsStore ?? []) as spec}
						<div class="skill-specialization-card">
							<div class="specialization-background"></div>
							<div class="specialization-name">{spec.name}</div>
							<h1 class="embedded-value">{spec.value}</h1>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="skill-card">
			<div class="skill-background-layer"></div>
			<h6 class="no-margin skill-name" title={item.name}>{item.name}</h6>
			<h5 class="no-margin">({linkedAttrName})</h5>
			<div
				class="skill-main-container button"
				role="button"
				tabindex="0"
				onclick={(e) => rollSkill(e)}
				onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSkill(e)}
			>
				<h1 class="skill-value">{valueStore ? $valueStore : 0}</h1>
			</div>

			{#if category === "language" && readWriteStore && ($readWriteStore ?? 0) > 0}
				<div class="specialization-container">
					<div
						class="skill-specialization-card button"
						role="button"
						tabindex="0"
						onclick={(e) => rollSkill(e)}
						onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSkill(e)}
					>
						<div class="specialization-background"></div>
						<div class="specialization-name">Read/Write</div>
						<h1 class="embedded-value">{$readWriteStore ?? 0}</h1>
					</div>
				</div>
			{/if}

			{#if specializationsStore && ($specializationsStore?.length ?? 0) > 0}
				<div class="specialization-container">
					{#each ($specializationsStore ?? []) as spec}
						<div
							class="skill-specialization-card button"
							role="button"
							tabindex="0"
							onclick={(e) => rollSpec(e, spec)}
							onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSpec(e, spec)}
						>
							<div class="specialization-background"></div>
							<div class="specialization-name">{spec.name}</div>
							<h1 class="embedded-value">{spec.value}</h1>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
