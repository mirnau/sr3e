<script>
	import { localize, toggleCardSpanById } from "../../../svelteHelpers.js";
	import SkillsLanguage from "../components/SkillsLangauge.svelte";
	import SkillsKnowledge from "../components/SkillsKnowledge.svelte";
	import SkillsActive from "../components/SkillsActive.svelte";

	let { actor = {}, config = {}, id = {} } = $props();


	    function toggleSpan() {
    toggleCardSpanById(id); 
    }



	let activeTab = $state("active");

	let skills = actor.skills || [];
	let activeSkills = $derived(skills.filter((s) => s.type === "active"));
	let knowledgeSkills = $derived(
		skills.filter((s) => s.type === "knowledge"),
	);
	let languageSkills = $derived(skills.filter((s) => s.type === "language"));
</script>


<div class="toolbar" onclick={(e) => e.stopPropagation()}>
  <button onclick={() => moveCard('up')}><i class="fa-solid fa-arrow-up"></i></button>
  <button onclick={() => moveCard('down')}><i class="fa-solid fa-arrow-down"></i></button>
  <button onclick={toggleSpan}><i class="fa-solid fa-expand-arrows-alt"></i></button>
</div>

<div class="skills">
	<h1>{localize(config.skills.skills)}</h1>

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
			<SkillsActive skills={activeSkills} />
		{:else if activeTab === "knowledge"}
			<SkillsKnowledge skills={knowledgeSkills} />
		{:else if activeTab === "language"}
			<SkillsLanguage skills={languageSkills} />
		{/if}
	</div>
</div>
