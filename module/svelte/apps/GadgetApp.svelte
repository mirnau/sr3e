<script>
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";

   let { item, config } = $props();
</script>

<Commodity {item}, {config} />
<Portability {item}, {config} />
