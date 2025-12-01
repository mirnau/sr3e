<script lang="ts">
   import SkillCategory from "./SkillCategory.svelte";
   import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import { StoreManager, stores } from "@sveltehelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {} } = $props();
   let gridContainer;

   let storeManager = StoreManager.Subscribe(actor);

   const knowledgeSkillsIdArrayStore = storeManager.GetShallowStore(
      actor.id,
      stores.knowledgeSkillsIds,
      actor.items
         .filter((item) => item.type === "skill" && item.system.skillType === "knowledge")
         .map((item) => item.id)
   );

   let knowledgeSkills = $derived(actor.items.filter((item) => $knowledgeSkillsIdArrayStore.includes(item.id)));

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
   <SkillCategory attribute="intelligence" skills={knowledgeSkills} {actor} {config} />
</div>
