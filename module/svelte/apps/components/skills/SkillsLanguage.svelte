<script lang="ts">
   import SkillCategory from "./SkillCategory.svelte";
   import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import { StoreManager, stores } from "@sveltehelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {} } = $props();
   let gridContainer;

   let storeManager = StoreManager.Subscribe(actor);

   const languageSkillsIdArrayStore = storeManager.GetShallowStore(
      actor.id,
      stores.languageSkillsIds,
      actor.items.filter((item) => item.type === "skill" && item.system.skillType === "language").map((item) => item.id)
   );

   let languageSkills = $derived(actor.items.filter((item) => $languageSkillsIdArrayStore.includes(item.id)));

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
   <SkillCategory attribute="intelligence" skills={languageSkills} {actor} {config} />
</div>
