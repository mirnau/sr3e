<script lang="ts">
   let { span = 1, children } = $props();
</script>

<div class={`packery-grid-item span-${span}`}>
   <div class={"sheet-card-component "}>
      <div class={"sheet-card-shadow"}></div>
      <div class={"sheet-card-outline"}>
         <div class={"sheet-card-displayarea"}></div>
         {@render children?.()}
      </div>
   </div>
</div>
