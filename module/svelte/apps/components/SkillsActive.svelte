<script>
    let { actor = {}, config = {} } = $props();

    let activeSkills = $state([]);
    $effect(() => {
        if (!actor?.id) return;
        activeSkills = actor.system.skills.filter(skill => skill.active);
    });

</script>
<div class="skill-card">

</div>