<script lang="ts">
   let { children } = $props();
</script>

<div class={"packery-grid-item"}>
   <div class={"sheet-card-component"}>
      <div class={"sheet-card-shadow"}></div>
      <div class={"sheet-card-displayarea"}>
         {@render children?.()}
      </div>
   </div>
</div>
