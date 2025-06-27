<script>
   import { getActorStore, stores } from "../../../stores/actorStores.js";
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { skill = {}, actor = {}, config = {} } = $props();

   let skillStoreManager = StoreManager.Subscribe(skill);
   let actorStoreManager = StoreManager.Subscribe(actor);

   let value = skillStoreManager.GetStore("knowledgeSkill.value");
   let specializations = skillStoreManager.GetStore("knowledgeSkill.specializations");

   let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);

   function openSkill() {
      ActiveSkillEditorSheet.launch(actor, skill, config);
   }

   onDestroy(() => {
      StoreManager.Unsubscribe(skill);
   });
</script>

<div class="skill-card-container">
   {#if $isShoppingState}
      <i
         class={`header-control icon fa-solid fa-pen-to-square pulsing-green-cart`}
         tabindex="0"
         role="button"
         aria-label={localize(config.sheet.buyupgrades)}
         onclick={openSkill}
         onkeydown={(e) => e.key === "Enter" && openSkill()}
      ></i>
   {/if}
   <div class="skill-card">
      <div class="core-skill">
         <div class="skill-background-layer"></div>
         <h6 class="no-margin skill-name">{skill.name}</h6>
         <h1 class="skill-value">{$value}</h1>
      </div>

      <div class="specialization-container">
         {#each $specializations as specialization}
            <div class="skill-specialization-card">
               <div class="specialization-background"></div>
               <div class="specialization-name">{specialization.name}</div>
               <h1 class="specialization-value">{specialization.value}</h1>
            </div>
         {/each}
      </div>
   </div>
</div>
