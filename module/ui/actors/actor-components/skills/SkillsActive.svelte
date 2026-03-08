<script lang="ts">
import SkillCard from "./SkillCard.svelte";

interface Props {
	actor: Actor | null;
	skills: Item[];
}

let { actor = null, skills }: Props = $props();

// Group skills by linkedAttribute, sorted alphabetically by attribute name
const groupedSkills = $derived(() => {
	const map = new Map<string, Item[]>();

	for (const item of skills) {
		const sys = item.system as Record<string, string>;
		const attr = sys?.linkedAttribute ?? "unknown";
		if (!map.has(attr)) map.set(attr, []);
		map.get(attr)!.push(item);
	}

	const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	return sorted;
});
</script>

<div class="skills-active-container">
	{#each groupedSkills() as [, groupSkills]}
		{#if groupSkills.length > 0}
			<div class="skill-attribute-group">
				<div class="skill-group-cards">
					{#each groupSkills as item (item.id)}
						<SkillCard {actor} {item} category="active" />
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>
