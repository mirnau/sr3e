<script>
   import SkillCategory from "./SkillCategory.svelte";
   import MasonryGrid from "../basic/MasonryGrid.svelte";
   import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
   import { masonryMinWidthFallbackValue } from "../../../../services/commonConsts.js";
   import { tick } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";

   let { actor = {}, config = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);

   const activeSkillsIdArrayStore = storeManager.GetShallowStore(
      actor.id,
      "activeSkillsIds",
      actor.items.filter((item) => item.type === "skill" && item.system.skillType === "active").map((item) => item.id)
   );

   let attributeSortedSkills = $derived(
      ["body", "quickness", "strength", "charisma", "intelligence", "willpower", "reaction"].map((attribute) => ({
         attribute,
         skills: actor.items.filter(
            (item) =>
               $activeSkillsIdArrayStore.includes(item.id) && item.system.activeSkill.linkedAttribute === attribute
         ),
      }))
   );
</script>

<MasonryGrid itemSelector="skill-category-container" gridPrefix="skill-container">
   {#each attributeSortedSkills as category}
      {#if category.skills.length > 0}
         <SkillCategory {...category} {actor} {config} />
      {/if}
   {/each}
</MasonryGrid>
