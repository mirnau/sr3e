<script lang="ts">
import SkillCard from "./SkillCard.svelte";

interface Props {
	actor: Actor | null;
	skills: Item[];
}

let { actor = null, skills }: Props = $props();
</script>

<div class="skill-group-cards">
	{#each skills as item (item.id)}
		<SkillCard {actor} {item} category="knowledge" />
	{/each}
</div>
