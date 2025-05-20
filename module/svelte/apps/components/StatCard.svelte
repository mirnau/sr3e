<script>
	let { item, entry, path, type = "text", options = [] } = $props();

	function update(e) {
		let val = e.target.value;
		if (type === "number") val = Number(val);
		item.update({ [`${path}.${entry.key}`]: val });
	}
</script>

<div class="stat-card">
	<div>
		<h4 class="no-margin">{entry.label}</h4>
	</div>
	<div class="stat-label">
		{#if type === "select"}
			<select value={entry.value} onchange={update}>
				{#each options as option}
					<option value={option} selected={entry.value === option}>{option}</option>
				{/each}
			</select>
		{:else}
			<input
				type={type}
				value={entry.value}
				onchange={update}
			/>
		{/if}
	</div>
</div>
