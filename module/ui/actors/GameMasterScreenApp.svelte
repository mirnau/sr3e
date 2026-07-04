<script lang="ts">
   import SheetCard from "../common-components/SheetCard.svelte";
   import KarmaManager from "./game-master-screen/KarmaManager.svelte";
   import TimeManager from "./game-master-screen/TimeManager.svelte";
   import PoolManager from "./game-master-screen/PoolManager.svelte";

   let activeTab = $state<"karma" | "pools">("karma");
</script>

<div class="game-master-screen">
   <SheetCard>
      <div class="game-master-screen__panel game-master-screen__panel--primary">
         <div class="skills-register">
            <button
               type="button"
               class="skills-register-tab"
               class:active={activeTab === "karma"}
               onclick={() => (activeTab = "karma")}
            ><span>Karma</span></button>
            <button
               type="button"
               class="skills-register-tab"
               class:active={activeTab === "pools"}
               onclick={() => (activeTab = "pools")}
            ><span>Dice Pools</span></button>
         </div>
         <div class="skills-content">
            <div class="skills-content-inner">
               {#if activeTab === "karma"}
                  <KarmaManager />
               {:else}
                  <PoolManager />
               {/if}
            </div>
         </div>
      </div>
   </SheetCard>
   <SheetCard>
      <div class="game-master-screen__panel">
         <TimeManager />
      </div>
   </SheetCard>
</div>
