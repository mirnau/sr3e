<script lang="ts">
	import { onMount } from "svelte";
	import { openFilePicker } from "../../services/utilities";

	let {
		src = $bindable(""),
		title = $bindable(""),
		alt = $bindable(""),
		entity = null,
	}: {
		src?: string;
		title?: string;
		alt?: string;
		entity?: Actor | Item | null;
	} = $props();

	onMount(() => {
		if (entity) {
			src ||= entity.img;
			title ||= entity.name;
			alt ||= entity.name;
		}
	});

	async function handleClick(event: MouseEvent) {
		if (entity) await openFilePicker(entity);
	}
</script>

<div class="image-mask">
	<img
		src={src}
		role="presentation"
		data-edit="img"
		title={title}
		alt={alt || title}
		onclick={handleClick}
	/>
</div>
