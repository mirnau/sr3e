<script lang="ts">
import { slide } from "svelte/transition";
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null, config = CONFIG.SR3E } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let actorNameStore = $state<Writable<string> | null>(null);
let isDetailsOpenStore = $state<Writable<boolean> | null>(null);

let metatype = $derived(actor?.items.find((i: any) => i.type === "metatype"));

$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);
	actorNameStore = storeManager.GetShallowStore<string>(actor, "actorName", actor.name);
	isDetailsOpenStore = storeManager.GetRWStore<boolean>(actor, "profile.isDetailsOpen");

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

function toggleDetails() {
	if (isDetailsOpenStore) {
		isDetailsOpenStore.update((val) => !val);
	}
}

function handleActorNameChange(event: Event) {
	if (actorNameStore) {
		const target = event.target as HTMLInputElement;
		actorNameStore.set(target.value);
	}
}

function cubicInOut(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) * 0.5;
}

function updateAge(event: Event) {
	const target = event.target as HTMLElement;
	actor?.update({ "system.profile.age": Number(target.innerText.trim()) }, { render: false });
}

function updateHeight(event: Event) {
	const target = event.target as HTMLElement;
	actor?.update({ "system.profile.height": Number(target.innerText.trim()) }, { render: false });
}

function updateWeight(event: Event) {
	const target = event.target as HTMLElement;
	actor?.update({ "system.profile.weight": Number(target.innerText.trim()) }, { render: false });
}

function updateQuote(event: Event) {
	const target = event.target as HTMLElement;
	actor?.update({ "system.profile.quote": target.innerText.trim() }, { render: false });
}

const profile = $derived(config.PROFILE);
</script>

{#if actor && actorNameStore && isDetailsOpenStore}
	<div class="dossier">
		{#if $isDetailsOpenStore}
			<img src={metatype?.img || actor.img} alt={metatype?.name || actor.name} title={metatype?.name || actor.name} />
		{:else}
			<img src={actor.img} alt={actor.name} title={actor.name} />
		{/if}

		<div class="dossier-details">
			<div
				class="details-foldout"
				role="button"
				tabindex="0"
				onclick={toggleDetails}
				onkeydown={(e) => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleDetails())}
			>
				<span><i class="fa-solid fa-magnifying-glass"></i></span>
				{localize(profile.isDetailsOpen)}
			</div>

			{#if $isDetailsOpenStore}
				<div in:slide={{ duration: 100, easing: cubicInOut }} out:slide={{ duration: 50, easing: cubicInOut }}>
					<div>
						<input
							type="text"
							id="actor-name"
							name="name"
							value={$actorNameStore}
							oninput={handleActorNameChange}
							onblur={handleActorNameChange}
							onkeypress={(e) => e.key === "Enter" && handleActorNameChange(e)}
						/>
					</div>
				</div>

				<div class="flavor-edit-block">
					<div class="editable-row">
						<div class="label-line-wrap">
							<div class="label">{localize(profile.age)}</div>
							<div class="dotted-line"></div>
						</div>
						<div class="value-unit">
							<div class="editable-field" contenteditable="true" onblur={updateAge}>
								{actor.system?.profile?.age || 0}
							</div>
							<span class="unit">yrs</span>
						</div>
					</div>

					<div class="editable-row">
						<div class="label-line-wrap">
							<div class="label">{localize(profile.height)}</div>
							<div class="dotted-line"></div>
						</div>
						<div class="value-unit">
							<div class="editable-field" contenteditable="true" onblur={updateHeight}>
								{actor.system?.profile?.height || 0}
							</div>
							<span class="unit">cm</span>
						</div>
					</div>

					<div class="editable-row">
						<div class="label-line-wrap">
							<div class="label">{localize(profile.weight)}</div>
							<div class="dotted-line"></div>
						</div>
						<div class="value-unit">
							<div class="editable-field" contenteditable="true" onblur={updateWeight}>
								{actor.system?.profile?.weight || 0}
							</div>
							<span class="unit">kg</span>
						</div>
					</div>
				</div>

				<div class="flavor-edit-block last-flavor-edit-block">
					<h4>{localize(profile.quote)}</h4>
					<div
						class="editable-field quote"
						role="presentation"
						contenteditable="true"
						onblur={updateQuote}
						onkeypress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								e.currentTarget.blur();
							}
						}}
					>
						{actor.system?.profile?.quote || ""}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Dossier.</p>
{/if}
