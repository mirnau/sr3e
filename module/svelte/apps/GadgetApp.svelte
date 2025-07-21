<script>
   import Commodity from "./components/Commodity.svelte";
   import Portability from "./components/Portability.svelte";

   let { item, config } = $props();
</script>

<Commodity {item}, {config} />
<Portability {item}, {config} />
