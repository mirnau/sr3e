<script lang="ts">
  let {children } = $props();
</script>

<div class="item-sheet-component">
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      {@render children?.()}
    </div>
  </div>
</div>
