<script lang="ts">
   import SheetCard from "../common-components/SheetCard.svelte";
   import KarmaManager from "./storyteller-screen/KarmaManager.svelte";
   import TimeManager from "./storyteller-screen/TimeManager.svelte";
</script>

<div class="storyteller-screen">
   <SheetCard>
      <div class="storyteller-screen__panel storyteller-screen__panel--primary">
         <KarmaManager />
      </div>
   </SheetCard>
   <SheetCard>
      <div class="storyteller-screen__panel">
         <TimeManager />
      </div>
   </SheetCard>
</div>
