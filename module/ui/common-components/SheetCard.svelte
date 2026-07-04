<script lang="ts">
   // itemClass lets a PackeryGrid nested inside another one (e.g. the
   // Garage tab's expanded vehicle sheet, itself inside the character
   // sheet's own top-level PackeryGrid) use a distinct item class — the
   // outer grid's querySelectorAll(itemSelector) otherwise also matches
   // the inner grid's cards, since class selectors don't respect
   // component/container boundaries, corrupting both layouts.
   let { span = 1, itemClass = "packery-grid-item", children } = $props<{
      span?: number | "dynamic";
      itemClass?: string;
      children?: () => unknown;
   }>();
</script>

<div class={span === "dynamic" ? `${itemClass} span-dynamic` : `${itemClass} span-${span}`}>
   <div class="sheet-card-component">
      <div class="sheet-card-shadow"></div>
      <div class="sheet-card-outline">
         <div class="sheet-card-displayarea"></div>
         {@render children?.()}
      </div>
   </div>
</div>
