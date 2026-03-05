<script lang="ts">
import SkillCard from "./SkillCard.svelte";

interface Props {
	actor: Actor | null;
	skills: Item[];
}

let { actor = null, skills }: Props = $props();
</script>

{#if skills.length === 0}
	<p class="no-skills">No language skills yet.</p>
{:else}
	<div class="skill-group-cards">
		{#each skills as item (item.id)}
			<SkillCard {actor} {item} category="language" />
		{/each}
	</div>
{/if}
