<script lang="ts">
   let { children, spanAll = false, spanTwo = false }: { children?: any; spanAll?: boolean; spanTwo?: boolean } = $props();
</script>

<div class="item-sheet-component" class:span-all={spanAll} class:span-two={spanTwo}>
   <div class="sheet-card-component">
      <div class="sheet-card-shadow"></div>
      <div class="sheet-card-outline">
         <div class="sheet-card-displayarea"></div>
         {@render children?.()}
      </div>
   </div>
</div>
