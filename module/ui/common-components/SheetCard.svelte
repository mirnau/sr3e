<script lang="ts">
   let { children } = $props();
</script>

<div class={"sheet-card-component packery-grid-item"}>
   <div class={"sheet-card-shadow"}>
      <div class={"sheet-card-displayarea"}>
         {@render children?.()}
      </div>
   </div>
</div>
