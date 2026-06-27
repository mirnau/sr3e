<script lang="ts">
import { slide } from "svelte/transition";
import { untrack } from "svelte";
import type { Snippet } from "svelte";

const p = $props<{ label: string; open?: boolean; children: Snippet }>();
const openDefault = untrack(() => p.open ?? true);
let isOpen = $state(openDefault);

function cubicInOut(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) * 0.5;
}

function toggle() { isOpen = !isOpen; }
</script>

<h1
	class="section-foldout"
	role="button"
	tabindex="0"
	onclick={toggle}
	onkeydown={(e) => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggle())}
>
	{p.label}
	<i class="fa-solid fa-chevron-{isOpen ? 'up' : 'down'}"></i>
</h1>

{#if isOpen}
	<div
		in:slide={{ duration: 100, easing: cubicInOut }}
		out:slide={{ duration: 50, easing: cubicInOut }}
	>
		{@render p.children()}
	</div>
{/if}
