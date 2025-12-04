<script lang="ts">
   import { onMount } from "svelte";
   import type { Packery } from "packery";
   import { setupPackery } from "../Packery/setupPackery";

   const { itemSelector = "packery-grid-item", gridPrefix = "packery", children } = $props<{
      itemSelector?: string;
      gridPrefix?: string;
      children: () => unknown;
      minItemWidth?: number;
   }>();

   let container: HTMLElement;
   let packeryInstance: Packery | undefined;
   let cleanup: (() => void) | undefined;

   onMount(() => {
      const result = setupPackery({
         container,
         itemSelector: `.${itemSelector}`,
         gridSizerSelector: `.${gridPrefix}-grid-sizer`,
         gutterSizerSelector: `.${gridPrefix}-gutter-sizer`,

      });

      packeryInstance = result.packeryInstance;
      cleanup = result.cleanup;

      container.dispatchEvent(new CustomEvent("packeryreflow", { bubbles: true }));

      return () => {
         cleanup?.();
      };
   });
</script>

<div bind:this={container} class={`${gridPrefix}-packery-grid`} 
   onpackeryreflow={() => {
      packeryInstance?.layout(); 
      console.log("CAT CAT CAT")}}>
   <div class={`${gridPrefix}-grid-sizer`}></div>
   <div class={`${gridPrefix}-gutter-sizer`}></div>
   {@render children?.()}
</div>
