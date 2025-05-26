<script>
	import { localize, openFilePicker } from "../../../svelteHelpers.js";
	import CardToolbar from "../components/CardToolbar.svelte";
	import SR3ESheetComponentApp from "./SR3ESheetComponentApp.svelte";
	let { item, config } = $props();

	const components = $state(item.system.components ?? []);

	async function addComponent() {
		const newComponent = {
			id: foundry.utils.randomID(),
			name: localize("sr3e.common.custom"),
			type: "custom",
			collapsed: false,
			statCards: [],
			position: { x: 0, y: 0 },
		};

		await item.update({
			"system.components": [...item.system.components, newComponent],
		});
	}
</script>

<!-- Header -->
<div class="sr3e-item-grid">
	<div class="sheet-component">
		<div class="sr3e-inner-background-container">
			<div class="fake-shadow"></div>
			<div class="sr3e-inner-background">
				<div class="image-mask">
					<img
						src={item.img}
						role="presentation"
						data-edit="img"
						title={item.name}
						alt={item.name}
						onclick={async () => {
							const path = await openFilePicker({
								current: item.img,
							});
							if (path) item.update({ img: path });
						}}
					/>
				</div>
				<input
					class="large"
					name="name"
					type="text"
					bind:value={item.name}
					onchange={(e) => item.update({ name: e.target.value })}
				/>
				<button onclick={addComponent}>
					+ {localize("sr3e.component.addComponent")}
				</button>
			</div>
		</div>
	</div>

<!-- Component Blocks -->
	{#each components as component (component.id)}
		<SR3ESheetComponentApp {item} {config} {component} />
	{/each}
</div>
