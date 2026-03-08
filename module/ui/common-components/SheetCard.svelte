<script lang="ts">
   let { span = 1, children } = $props<{ span?: number | "dynamic"; children?: () => unknown }>();
</script>

<div class={span === "dynamic" ? "packery-grid-item span-dynamic" : `packery-grid-item span-${span}`}>
   <div class={"sheet-card-component "}>
      <div class={"sheet-card-shadow"}></div>
      <div class={"sheet-card-outline"}>
         <div class={"sheet-card-displayarea"}></div>
         {@render children?.()}
      </div>
   </div>
</div>
