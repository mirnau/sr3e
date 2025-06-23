<script>
  let { arsenal = [], actor, config } = $props();
</script>

<div>
  {#each arsenal as item}
    <div value={item.id}>
      <div>
        {item.name}
      </div>
    </div>
  {/each}
</div>
