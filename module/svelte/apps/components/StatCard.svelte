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
		let val;
		if (type === "checkbox") {
			val = e.target.checked;
		} else {
			val = e.target.value;
			if (type === "number") val = Number(val);
		}
		item.update({ [`${path}.${key}`]: val });
		console.log(`Updated ${path}.${key} to`, val);
	}
</script>

<div class="stat-card">
	<div>
		<h4>{label}</h4>
	</div>
	{#if type === "checkbox"}
		<input type="checkbox" checked={value} onchange={update} />
	{:else if type === "select"}
		<select value={value} onchange={update}>
			{#each options as option}
				<option value={option} selected={value === option}>{option}</option>
			{/each}
		</select>
	{:else}
		<input {type} value={value} onchange={update} />
	{/if}
</div>
