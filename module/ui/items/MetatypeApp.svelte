<script lang="ts">
	import { localize } from "../../services/utilities";
	import StatCard from "../common-components/StatCard.svelte";
	import Image from "../common-components/Image.svelte";
	import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
	import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
	import JournalViewer from "../common-components/JournalViewer.svelte";
	import SR3EItem from "../../documents/SR3EItem";

	let { item }: { item: SR3EItem } = $props();

	const system = $state(item.system);

	const attributes = CONFIG.SR3E.ATTRIBUTES;
	const common = CONFIG.SR3E.COMMON;
	const karmaConfig = CONFIG.SR3E.KARMA;
	const traits = CONFIG.SR3E.METATYPE;

	const agerange = $derived([
		{
			item,
			key: "min",
			label: localize(common.min ?? "sr3e.common.min"),
			value: system.agerange.min,
			path: "system.agerange",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "average",
			label: localize(common.average ?? "sr3e.common.average"),
			value: system.agerange.average,
			path: "system.agerange",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "max",
			label: localize(common.max ?? "sr3e.common.max"),
			value: system.agerange.max,
			path: "system.agerange",
			type: "number" as const,
			options: [],
		},
	]);

	const height = $derived([
		{
			item,
			key: "min",
			label: localize(common.min ?? "sr3e.common.min"),
			value: system.physical.height.min,
			path: "system.physical.height",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "average",
			label: localize(common.average ?? "sr3e.common.average"),
			value: system.physical.height.average,
			path: "system.physical.height",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "max",
			label: localize(common.max ?? "sr3e.common.max"),
			value: system.physical.height.max,
			path: "system.physical.height",
			type: "number" as const,
			options: [],
		},
	]);

	const weight = $derived([
		{
			item,
			key: "min",
			label: localize(common.min ?? "sr3e.common.min"),
			value: system.physical.weight.min,
			path: "system.physical.weight",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "average",
			label: localize(common.average ?? "sr3e.common.average"),
			value: system.physical.weight.average,
			path: "system.physical.weight",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "max",
			label: localize(common.max ?? "sr3e.common.max"),
			value: system.physical.weight.max,
			path: "system.physical.weight",
			type: "number" as const,
			options: [],
		},
	]);

	const karma = $derived([
		{
			item,
			key: "factor",
			label: localize(karmaConfig.advancementratio ?? "sr3e.karma.advancementratio"),
			value: system.karma.factor,
			path: "system.karma",
			type: "number" as const,
			options: [],
		},
	]);

	const movement = $derived([
		{
			item,
			key: "factor",
			label: localize(CONFIG.SR3E.MOVEMENT.runSpeedModifier ?? "sr3e.movement.runSpeedModifier"),
			value: system.movement.factor,
			path: "system.movement",
			type: "number" as const,
			options: [],
		},
	]);

	const attributeLimits = $derived([
		{
			item,
			key: "strength",
			label: localize(attributes.strength ?? "sr3e.attributes.strength"),
			value: system.attributeLimits.strength,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "quickness",
			label: localize(attributes.quickness ?? "sr3e.attributes.quickness"),
			value: system.attributeLimits.quickness,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "body",
			label: localize(attributes.body ?? "sr3e.attributes.body"),
			value: system.attributeLimits.body,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "charisma",
			label: localize(attributes.charisma ?? "sr3e.attributes.charisma"),
			value: system.attributeLimits.charisma,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "intelligence",
			label: localize(attributes.intelligence ?? "sr3e.attributes.intelligence"),
			value: system.attributeLimits.intelligence,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
		{
			item,
			key: "willpower",
			label: localize(attributes.willpower ?? "sr3e.attributes.willpower"),
			value: system.attributeLimits.willpower,
			path: "system.attributeLimits",
			type: "number" as const,
			options: [],
		},
	]);

	const priorityEntry = $derived({
		item,
		key: "priority",
		label: "Select Priority",
		value: system.priority,
		path: "system",
		type: "select" as const,
		options: ["C", "D", "E"].map((p) => ({ value: p, label: p })),
	});
</script>

<ItemSheetWrapper csslayout="double">
	<!-- Name and Priority -->
	<ItemSheetComponent>
		<Image entity={item} />
		<input
			class="large"
			name="name"
			type="text"
			bind:value={item.name}
			onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
		/>
		<StatCard {...priorityEntry} />
	</ItemSheetComponent>

	<!-- Age Range -->
	{#if agerange}
		<ItemSheetComponent>
			<h3 class="item">{localize(traits.agerange ?? "sr3e.metatype.agerange")}</h3>
			<div class="stat-grid">
				{#each agerange as entry}
					<StatCard {...entry} />
				{/each}
			</div>
		</ItemSheetComponent>
	{/if}

	<!-- Height -->
	{#if height}
		<ItemSheetComponent>
			<h3 class="item">{localize(traits.height ?? "sr3e.metatype.height")}</h3>
			<div class="stat-grid">
				{#each height as entry}
					<StatCard {...entry} />
				{/each}
			</div>
		</ItemSheetComponent>
	{/if}

	<!-- Weight -->
	{#if weight}
		<ItemSheetComponent>
			<h3 class="item">{localize(traits.weight ?? "sr3e.metatype.weight")}</h3>
			<div class="stat-grid">
				{#each weight as entry}
					<StatCard {...entry} />
				{/each}
			</div>
		</ItemSheetComponent>
	{/if}

	<!-- Attribute Limits -->
	<ItemSheetComponent>
		<h3 class="item">{localize(attributes.limits ?? "sr3e.attributes.limits")}</h3>
		<div class="stat-grid">
			{#each attributeLimits as entry}
				<StatCard {...entry} />
			{/each}
		</div>
	</ItemSheetComponent>

	<ItemSheetComponent>
		<h3 class="item">Movement</h3>
		<div class="stat-grid single-column">
			{#each movement as entry}
				<StatCard {...entry} />
			{/each}
		</div>
	</ItemSheetComponent>

	<!-- Karma -->
	<ItemSheetComponent>
		<h3 class="item">{localize(karmaConfig.karma ?? "sr3e.karma.karma")}</h3>
		<div class="stat-grid single-column">
			{#each karma as entry}
				<StatCard {...entry} />
			{/each}
		</div>
	</ItemSheetComponent>

	<!-- Journal Viewer -->
	<JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
