<script>
	let {
		item,
		path,
		key,
		label,
		value: incomingValue, // Confirmed t
		type = "text",
		options = [],
	} = $props();

	const [, , c, , s] = path.split(".");

	console.log("incomingValue:", incomingValue);

	let parsedValue = $state(incomingValue);

	async function update(e) {
		let rawValue;
		if (type === "boolean") rawValue = e.target.checked;
		else if (type === "number") rawValue = Number(e.target.value);
		else if (type === "multiselect")
			rawValue = Array.from(e.target.selectedOptions).map((o) => o.value);
		else rawValue = e.target.value;

		const components = foundry.utils.deepClone(item.system.components);
		const component = components[c];

		if (!component?.SheetComponents?.[s]) {
			console.error(`Invalid stat index [${s}] on component ${c}`);
			return;
		}

		component.SheetComponents[s][key] = JSON.stringify(rawValue);

		await item.update({
			"system.components": components,
		});

		parsedValue = rawValue;
	}
</script>

<div class="stat-card">
	<h4>{label}</h4>

	{#if type === "boolean"}
		<input type="checkbox" checked={parsedValue} onchange={update} />
	{:else if type === "select"}
		<select value={parsedValue} onchange={update}>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	{:else if type === "multiselect"}
		<select multiple onchange={update}>
			{#each options as option}
				<option value={option} selected={parsedValue?.includes(option)}
					>{option}</option
				>
			{/each}
		</select>
	{:else if type === "image"}
		<img src={parsedValue} alt={label} />
		<input type="text" value={parsedValue} onchange={update} />
	{:else}
		<input
			{type}
			value={parsedValue}
			onchange={update}
			onkeydown={(e) => e.key === "Enter" && e.preventDefault()}
		/>
	{/if}
</div>
