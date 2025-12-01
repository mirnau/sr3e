<script lang="ts">
  import Image from "@sveltecomponent/basic/Image.svelte";
  let { actor, config, id, span } = $props();
</script>

<div class="mechanical-header">
  <div class="mechanical-banner">
    <Image entity={actor} />
  </div>
  <div class="stat-grid single-column">
    <div class="stat-card">
      <div class="stat-card-background"></div>
      <input
        class="large"
        name="name"
        type="text"
        value={actor.name}
        onchange={(e) => actor.update({ name: e.target.value })}
      />
    </div>
  </div>
  
</div>
