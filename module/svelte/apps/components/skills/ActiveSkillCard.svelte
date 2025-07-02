<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { skill = {}, actor = {}, config = {} } = $props();

   let skillStoreManager = StoreManager.Subscribe(skill);
   let actorStoreManager = StoreManager.Subscribe(actor);

   let valueStore = skillStoreManager.GetStore("activeSkill.value");
   let specializationsStore = skillStoreManager.GetStore("activeSkill.specializations");

   let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);

   function openSkill() {
      ActiveSkillEditorSheet.launch(actor, skill, config);
   }

   function Roll(id, specialization) {
      if (!specialization) {
         console.log("A skill roll!");
      } else {
         console.log("A specialization roll!");
      }
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
      <div class="skill-card">
         <div class="skill-background-layer"></div>

         <h6 class="no-margin skill-name">{skill.name}</h6>

         <div class="skill-main-container">
            <h1 class="skill-value">{$valueStore}</h1>
         </div>
         <div class="specialization-container">
            {#each $specializationsStore as specialization}
               <div class="skill-specialization-card">
                  <div class="specialization-background"></div>
                  <div class="specialization-name">{specialization.name}</div>
                  <h1 class="embedded-value">{specialization.value}</h1>
               </div>
            {/each}
         </div>
      </div>
   {:else}
      <div class="skill-card">
         <div class="skill-background-layer"></div>

         <h6 class="no-margin skill-name">{skill.name}</h6>

         <div
            class="skill-main-container button"
            role="button"
            tabindex="0"
            onclick={() => Roll(skill.id)}
            onkeydown={(e) => {
               if (e.key === "Enter" || e.key === " ") Roll(skill.id);
            }}
         >
            <h1 class="skill-value">{$valueStore}</h1>
         </div>
         <div class="specialization-container">
            {#each $specializationsStore as specialization}
               <div
                  class="skill-specialization-card"
                  class:button={!$isShoppingState}
                  role="button"
                  tabindex="0"
                  onclick={() => Roll(skill.id, specialization.name)}
                  onkeydown={(e) => {
                     if (e.key === "Enter" || e.key === " ") Roll(skill.id, specialization.name);
                  }}
               >
                  <div class="specialization-background"></div>
                  <div class="specialization-name">{specialization.name}</div>
                  <h1 class="embedded-value">{specialization.value}</h1>
               </div>
            {/each}
         </div>
      </div>
   {/if}
</div>
