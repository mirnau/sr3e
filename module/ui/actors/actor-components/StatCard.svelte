<script lang="ts">
/**
 * StatCard - Reusable card component with attribute card styling.
 * Used for dice pools, movement, health stats, and similar displays.
 */
import type { Snippet } from "svelte";

interface Props {
   label: string;
   children?: Snippet;
   onclick?: (e: MouseEvent) => void;
}

let { label, children, onclick }: Props = $props();
</script>

<div class="stat-card-wrapper">
   <div class="attribute-card">
      <div class="attribute-card-shadow"></div>
      <div
         class="attribute-card-outline{onclick ? ' rollable' : ''}"
         role={onclick ? 'button' : undefined}
         tabindex={onclick ? 0 : undefined}
         {onclick}
         onkeydown={onclick ? (e) => (e.key === 'Enter' || e.key === ' ') && onclick(new MouseEvent('click')) : undefined}
      >
         <div class="attribute-card-displayarea"></div>
         <h4 class="attribute-label">{label}</h4>
         <div class="attribute-value-row">
            {#if children}
               {@render children()}
            {/if}
         </div>
      </div>
   </div>
</div>
