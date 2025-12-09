<script lang="ts">
   let { children }: { children?: any } = $props();
</script>

<div class="item-sheet-component">
   <div class={"sheet-card-component "}>
      <div class={"sheet-card-shadow"}></div>
      <div class={"sheet-card-outline"}>
         <div class={"sheet-card-displayarea"}></div>
         {@render children?.()}
      </div>
   </div>
</div>
