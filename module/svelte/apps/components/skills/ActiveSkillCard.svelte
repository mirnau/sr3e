<script>
	let { skill = {}, config = {} } = $props();

	let activeSkill = $state(skill.system.activeSkill);
	let specializations = $state(activeSkill.specializations);
</script>

<div class="skill-card">
	<div class="skill-background-layer"></div>
	
	<div class="core-skill">

			<h6 class="no-margin skill-name">
				{skill.name}
			</h6>
			
			<h1 class="skill-value">
				{activeSkill.value}
			</h1>
	</div>

	<div class="specialization-container">
		{#each specializations as specialization}
			<div class="skill-specialization-card">
				<!-- Specialization background layer replaces ::before -->
				<div class="specialization-background"></div>
				
				<div class="specialization-name">
					{specialization.name}
				</div>
				<h1 class="specialization-value">
					{specialization.value}
				</h1>
			</div>
		{/each}
	</div>
</div>