<script lang="ts">
import SkillCard from "./SkillCard.svelte";
import PackeryGrid from "../../../common-components/PackeryGrid.svelte";

interface Props {
	actor: Actor | null;
	skills: Item[];
}

let { actor = null, skills }: Props = $props();
</script>

<PackeryGrid gridPrefix="skills" itemSelector="skill-card-container">
	{#each skills as item (item.id)}
		<SkillCard {actor} {item} category="language" />
	{/each}
</PackeryGrid>
