<script>
	let {
		item,
		key,
		label,
		value,
		path,
		type = "text",
		options = []
	} = $props();

	function update(e) {
		let val = e.target.value;
		if (type === "number") val = Number(val);
		item.update({ [`${path}.${key}`]: val });
	}
</script>

<div class="stat-card">
	<div>
		<h4>{label}</h4>
	</div>
	{#if type === "select"}
		<div class="select-container">
			<select value={value} onchange={update}>
				{#each options as option}
					<option value={option} selected={value === option}>
						{option}
					</option>
				{/each}
			</select>
		</div>
	{:else}
		<input {type} value={value} onchange={update} />
	{/if}
</div>
