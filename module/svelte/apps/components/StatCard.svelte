<script>
	let {
		item,
		key,
		label,
		value,
		path,
		type = "text",
		options = [],
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
		<div class="select-container stat-card">
			<select {value} onchange={update}>
				{#each options as option}
					<option value={option} selected={value === option}>
						{option}
					</option>
				{/each}
			</select>
		</div>
	{:else}
		<div class="stat-card">
			<input {type} {value} onchange={update} />
		</div>
	{/if}
</div>
