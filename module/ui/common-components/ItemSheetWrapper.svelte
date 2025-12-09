<script lang="ts">
	let { csslayout, children }: { csslayout: string; children?: any } = $props();
</script>

<div class="sr3e-waterfall-wrapper">
	<div class={`sr3e-waterfall sr3e-waterfall--${csslayout}`}>
		{@render children?.()}
	</div>
</div>
