<!-- Simplified HTML Structure -->
<script>
	import { getActorStore, stores } from "../../../stores/actorStores.js";
	import { localize } from "../../../../svelteHelpers.js";
	import { flags } from "../../../../foundry/services/commonConsts.js";
	import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
	import { mount } from "svelte";

	let { skill = {}, actor = {}, config = {} } = $props();

	let isShoppingState = getActorStore(
		actor.id,
		stores.isShoppingState,
		actor.getFlag(flags.sr3e, flags.isShoppingState),
	);

	let languageSkill = $state(skill.system.languageSkill);
	let value = getActorStore(actor.id, skill.id, languageSkill.value);
	let specializations = getActorStore(
		skill.id,
		actor.id,
		skill.system.languageSkill.specializations,
	);

	let speakValue = getActorStore(
		actor.id,
		skill.id,
		languageSkill.speak.value,
	);
	let readValue = getActorStore(actor.id, skill.id, languageSkill.read.value);
	let writeValue = getActorStore(
		actor.id,
		skill.id,
		languageSkill.write.value,
	);

	let speakSpecs = getActorStore(
		skill.id,
		actor.id,
		languageSkill.speak.specializations,
	);

	let readSpecs = getActorStore(
		skill.id,
		actor.id,
		languageSkill.read.specializations,
	);

	let writeSpecs = getActorStore(
		skill.id,
		actor.id,
		languageSkill.write.specializations,
	);

	function openSkill() {
		ActiveSkillEditorSheet.launch(actor, skill, config);
	}
</script>

<div class="skill-card-container">
	{#if $isShoppingState}
		<i
			class="header-control icon fa-solid fa-pen-to-square pulsing-green-cart"
			tabindex="0"
			role="button"
			aria-label={localize(config.sheet.buyupgrades)}
			onclick={openSkill}
			onkeydown={(e) => e.key === "Enter" && openSkill()}
		></i>
	{/if}

	<div class="skill-card language-skill">
		{#each [{ key: "speak", label: "Speak", value: $speakValue, specs: $speakSpecs }, { key: "read", label: "Read", value: $readValue, specs: $readSpecs }, { key: "write", label: "Write", value: $writeValue, specs: $writeSpecs }] as mode}
			<div class="language-mode-block">
				<div class="core-skill">
					<div class="skill-background-layer"></div>
					<h6 class="skill-name">{mode.label}</h6>
					<h1 class="skill-value">{mode.value}</h1>
				</div>

				<div class="specialization-container">
					{#each mode.specs as specialization}
						<div class="skill-specialization-card">
							<div class="specialization-background"></div>
							<div class="specialization-name">
								{specialization.name}
							</div>
							<h1 class="specialization-value">
								{specialization.value}
							</h1>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
