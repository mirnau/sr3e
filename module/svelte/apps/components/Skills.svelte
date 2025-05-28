<script>
	import { localize } from "../../../svelteHelpers.js";
	import SkillsLanguage from "../components/SkillsLangauge.svelte";
	import SkillsKnowledge from "../components/SkillsKnowledge.svelte";
	import SkillsActive from "../components/SkillsActive.svelte";
	import CardToolbar from "./CardToolbar.svelte";

	let { actor = {}, config = {}, id = {}, span = {} } = $props();

	let activeTab = $state("active");

	let skill = actor.skill || [];
	let activeSkills = $derived(skill.filter((s) => s.type === "active"));
	let knowledgeSkills = $derived(
		skill.filter((s) => s.type === "knowledge"),
	);
	let languageSkills = $derived(skill.filter((s) => s.type === "language"));
</script>


<CardToolbar id={id} />

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
			<SkillsActive skill={activeSkills} />
		{:else if activeTab === "knowledge"}
			<SkillsKnowledge skill={knowledgeSkills} />
		{:else if activeTab === "language"}
			<SkillsLanguage skill={languageSkills} />
		{/if}
	</div>
</div>