<script lang="ts">
   import PackeryGrid from "../common-components/PackeryGrid.svelte";
   import SheetCard from "../common-components/SheetCard.svelte";
   import Attributes from "./actor-components/Attributes.svelte";
   import DicePools from "./actor-components/DicePools.svelte";
   import Dossier from "./actor-components/Dossier.svelte";
   import Health from "./actor-components/Health.svelte";
   //import Karma from "./actor-components/Karma.svelte";
   import Movement from "./actor-components/Movement.svelte";

   const { actor } = $props<{
      actor: Actor;
      form: HTMLFormElement;
   }>();
</script>

<PackeryGrid>
   <SheetCard>
      <Dossier {actor} />
   </SheetCard>
   <SheetCard>
      <Attributes {actor} />
   </SheetCard>
   <SheetCard>
      <DicePools {actor} />
   </SheetCard>
   <SheetCard>
      <Movement {actor} />
   </SheetCard>
   <SheetCard>
      <Health {actor} />
   </SheetCard>
</PackeryGrid>
