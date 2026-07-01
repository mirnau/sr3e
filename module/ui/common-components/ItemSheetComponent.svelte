<script lang="ts">
   let {
      children,
      title = "",
      spanAll = false,
      spanTwo = false,
   }: {
      children?: any;
      title?: string;
      spanAll?: boolean;
      spanTwo?: boolean;
   } = $props();
</script>

<div class="item-sheet-component" class:span-all={spanAll} class:span-two={spanTwo}>
   <div class="sheet-card-component">
      <div class="sheet-card-shadow"></div>
      <div class="sheet-card-outline">
         <div class="sheet-card-displayarea"></div>
         {#if title}
            <h3>{title}</h3>
         {/if}
         {@render children?.()}
      </div>
   </div>
</div>
