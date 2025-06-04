<script>

    import ActiveSkillCard from "./ActiveSkillCard.svelte";

    let { actor = {}, config = {} } = $props();

    const activeSkills = actor.items?.filter(
        (item) => item.type === "skill" && item.system.skillType === "active",
    );

    //console.log("activeSkills", {activeSkills});
</script>

{#each activeSkills as skill}

    <ActiveSkillCard {skill} {config}/>

{/each}
