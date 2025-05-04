<script>
	import { localize } from "../../../foundry/SvelteHelpers.js";
	import SkillsLanguage from "../components/SkillsLangauge.svelte";
    import SkillsKnowledge from "../components/SkillsKnowledge.svelte";
    import SkillsActive from "../components/SkillsActive.svelte";  

	let { actor = {}, config = {} } = $props();

	let activeTab = $state('active');

	let skills = actor.skills || [];
	let activeSkills = $derived(skills.filter(s => s.type === 'active'));
	let knowledgeSkills = $derived(skills.filter(s => s.type === 'knowledge'));
	let languageSkills = $derived(skills.filter(s => s.type === 'language'));
</script>

<div class="skills">
	<h1>{localize(config.skills.skills)}</h1>

	<div class="tabs">
		<button onclick={() => activeTab = 'active'}>Active</button>
		<button onclick={() => activeTab = 'knowledge'}>Knowledge</button>
		<button onclick={() => activeTab = 'language'}>Language</button>
	</div>

	{#if activeTab === 'active'}
		<SkillsActive skills={activeSkills} />
	{:else if activeTab === 'knowledge'}
		<SkillsKnowledge skills={knowledgeSkills} />
	{:else if activeTab === 'language'}
		<SkillsLanguage skills={languageSkills} />
	{/if}
</div>
