<script>
	import { localize } from "../../../../svelteHelpers.js";
	import SkillsLanguage from "./SkillsLanguage.svelte";
	import SkillsKnowledge from "./SkillsKnowledge.svelte";
	import SkillsActive from "./SkillsActive.svelte";
	import CardToolbar from "../CardToolbar.svelte";

	let { actor = {}, config = {}, id = {}, span = {} } = $props();

	let activeTab = $state("active");

</script>

<CardToolbar {id} />

<div class="skill">
	<h1>{localize(config.skill.skill)}</h1>

	<div class="sr3e-tabs">
		<button
			class:active={activeTab === "active"}
			onclick={() => (activeTab = "active")}>Active Skills</button
		>
		<button
			class:active={activeTab === "knowledge"}
			onclick={() => (activeTab = "knowledge")}>Knowledge Skills</button
		>
		<button
			class:active={activeTab === "language"}
			onclick={() => (activeTab = "language")}>Language Skills</button
		>
	</div>

	<div class="sr3e-inner-background">
		{#if activeTab === "active"}
			<SkillsActive {actor} {config} />
		{:else if activeTab === "knowledge"}
			<SkillsKnowledge {actor} {config} />
		{:else if activeTab === "language"}
			<SkillsLanguage {actor} {config} />
		{/if}
	</div>
</div>
