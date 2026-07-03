<script lang="ts">
   import SheetCard from "../common-components/SheetCard.svelte";
   import KarmaManager from "./game-master-screen/KarmaManager.svelte";
   import TimeManager from "./game-master-screen/TimeManager.svelte";
</script>

<div class="game-master-screen">
   <SheetCard>
      <div class="game-master-screen__panel game-master-screen__panel--primary">
         <KarmaManager />
      </div>
   </SheetCard>
   <SheetCard>
      <div class="game-master-screen__panel">
         <TimeManager />
      </div>
   </SheetCard>
</div>
