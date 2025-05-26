<script>
	let {
		item,
		path,
		key,
		label,
		value,
		type = "text",
		options = [],
	} = $props();

	const [, , c, , s] = path.split(".");

	let parsed = JSON.parse(item.system.components[c].SheetComponents[s][key]);

	let localValue = $state(parsed);

	console.log(localValue); //Returns 0 when I update to 5

	function ensureValidStatCard(card) {
		card.id ??= foundry.utils.randomID();
		card.name ??= "Untitled Stat";
		card.type ??= "text";
		card.value ??= "";
		card.options ??= [];
		card.description ??= "";
		card.required ??= false;
		return card;
	}

	async function update(e) {
		let val;

		switch (type) {
			case "boolean":
				val = e.target.checked;
				break;
			case "number":
				val = Number(e.target.value);
				break;
			case "multiselect":
				val = Array.from(e.target.selectedOptions).map((o) => o.value);
				break;
			default:
				val = e.target.value;
		}

		const [, , c, , s] = path.split(".");
		await item.update({
			[`system.components.${c}.SheetComponents.${s}.${key}`]: val,
		});

		parsed = val;
	}
</script>

<div class="stat-card">
	<h4>{label}</h4>

	{#if type === "boolean"}
		<input type="checkbox" checked={localValue} onchange={update} />
	{:else if type === "select"}
		<select value={localValue} onchange={update}>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	{:else if type === "multiselect"}
		<select multiple onchange={update}>
			{#each options as option}
				<option
					value={option}
					selected={localValue && localValue.includes(option)}
					>{option}</option
				>
			{/each}
		</select>
	{:else if type === "image"}
		<img src={localValue} alt={label} />
		<input type="text" value={localValue} onchange={update} />
	{:else}
		<input
			{type}
			value={localValue}
			onchange={update}
			onkeydown={(e) => {
				if (e.key === "Enter") e.preventDefault();
			}}
		/>
	{/if}
</div>
