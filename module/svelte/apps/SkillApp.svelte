<script>
	import { localize, openFilePicker } from "../../svelteHelpers.js";
	import ActorDataService from "../../foundry/services/ActorDataService.js";
	import JournalViewer from "./components/JournalViewer.svelte";

	let { item, config, onTitleChange } = $props();
	let value = $state(item.system.skillType || "active");

	let mode = $state("single");
	let wrapper;
	
	const ro = new ResizeObserver(() => {
		requestAnimationFrame(() => {
			if (!wrapper) return;

			// Check if content actually needs two columns
			const items = wrapper.querySelectorAll(".item-sheet-component");
			const totalHeight = Array.from(items).reduce(
				(sum, item) => sum + item.offsetHeight,
				0,
			);
			const averageItemHeight = totalHeight / items.length;

			// Only switch to double if we have enough content to justify it
			const newMode =
				totalHeight > 400 &&
				items.length > 1 &&
				totalHeight > averageItemHeight * 3
					? "double"
					: "single";
			if (mode !== newMode) mode = newMode;
		});
	});

	$effect(() => {
		if (!wrapper) return;
		ro.observe(wrapper);
		return () => ro.disconnect();
	});

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

	function updateSkillType(newValue) {
		value = newValue;
		item.update({ "system.skillType": newValue });
		onTitleChange(`${localize(config.skill[newValue])}: ${item.name}`);
	}
</script>

<div bind:this={wrapper} class="sr3e-waterfall-wrapper">
	<div class={`sr3e-waterfall sr3e-waterfall--${mode}`}>
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
