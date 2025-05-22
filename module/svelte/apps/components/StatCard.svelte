<script>
	let { item, entry, path, type = "text", options = [] } = $props();

	function update(e) {
		let val = e.target.value;
		if (type === "number") val = Number(val);
		item = item;
		item.update({ [`${path}.${entry.key}`]: val });
	}
</script>

<div class="stat-card">
	<div>
		<h4>{entry.label}</h4>
	</div>
	{#if type === "select"}
		<div class="select-container">
			<select value={entry.value} onchange={update}>
				{#each options as option}
					<option value={option} selected={entry.value === option}
						>{option}</option
					>
				{/each}
			</select>
		</div>
	{:else}
		<input {type} value={entry.value} onchange={update} />
	{/if}
</div>
