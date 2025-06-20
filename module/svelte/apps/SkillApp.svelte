<script>
	import { localize, openFilePicker } from "../../svelteHelpers.js";
	import ActorDataService from "../../foundry/services/ActorDataService.js";
	import JournalViewer from "./components/JournalViewer.svelte";
	import { onMount } from "svelte";

	let layoutMode = $state("single");

	let { item, config, onTitleChange } = $props();

	let value = $derived(item.system.skillType);

	const selectOptions = [
		{ value: "active", label: localize(config.skill.active) },
		{ value: "knowledge", label: localize(config.skill.knowledge) },
		{ value: "language", label: localize(config.skill.language) },
	];

	const rawAttributes = ActorDataService.getLocalizedLinkingAttributes();
	const attributeOptions = Object.entries(rawAttributes).map(
		([key, label]) => ({
			value: key,
			label,
		}),
	);

	async function updateSkillType(newValue) {
		await item.update({ "system.skillType": newValue });
		onTitleChange(`${localize(config.skill[newValue])}: ${item.name}`);

		// Force the document to re-resolve its schema
		await item._preloadData(); // Optional: depending on your system

		console.log("🔍 Skill created:", duplicate(item.toObject()));
	}
</script>

<div class="sr3e-waterfall-wrapper">
	<div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
		<div class="item-sheet-component">
			<div class="sr3e-inner-background-container">
				<div class="fake-shadow"></div>
				<div class="sr3e-inner-background">
					<div class="image-mask">
						<img
							src={item.img}
							role="presentation"
							data-edit="img"
							title={item.name}
							alt={item.name}
							onclick={async () => openFilePicker(item)}
						/>
					</div>
					<div class="stat-grid single-column">
						<div class="stat-card">
							<div class="stat-card-background"></div>
							<input
								class="large"
								name="name"
								type="text"
								value={item.name}
								onchange={(e) =>
									item.update({ name: e.target.value })}
							/>
						</div>

						<div class="stat-card">
							<div class="stat-card-background"></div>
							<select
								{value}
								onchange={(e) =>
									updateSkillType(e.target.value)}
							>
								{#each selectOptions as option}
									<option value={option.value}
										>{option.label}</option
									>
								{/each}
							</select>
						</div>

						{#if value === "active"}
							<div class="stat-card">
								<div class="stat-card-background"></div>
								<select
									value={item.system.activeSkill
										.linkedAttribute}
									onchange={(e) =>
										item.update({
											"system.activeSkill.linkedAttribute":
												e.target.value,
										})}
								>
									<option disabled value="">
										{localize(config.skill.linkedAttribute)}
									</option>
									{#each attributeOptions as option}
										<option value={option.value}
											>{option.label}</option
										>
									{/each}
								</select>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<JournalViewer {item} {config} />
	</div>
</div>
