<script lang="ts">
   import PackeryGrid from "../common-components/PackeryGrid.svelte";
   import Attributes from "./actor-components/Attributes.svelte";
   import DicePools from "./actor-components/DicePools.svelte";
   import Dossier from "./actor-components/Dossier.svelte";
   import Health from "./actor-components/Health.svelte";
   import Karma from "./actor-components/Karma.svelte";
   import Movement from "./actor-components/Movement.svelte";

   const { actor } = $props<{
      actor: Actor;
      form: HTMLFormElement;
   }>();
</script>

<PackeryGrid>
   
   <Attributes {actor} />
   <Dossier {actor} />
   <DicePools {actor} />
   <Movement {actor} />
   <Health {actor} />
   <Karma {actor} />
</PackeryGrid>
