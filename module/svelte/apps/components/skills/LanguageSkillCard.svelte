<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { skill = {}, actor = {}, config = {} } = $props();

   let skillStoreManager = StoreManager.Subscribe(skill);
   let actorStoreManager = StoreManager.Subscribe(actor);

   let valueStore = skillStoreManager.GetRWStore("languageSkill.value");
   let readWriteStore = skillStoreManager.GetRWStore("languageSkill.readwrite.value");
   let specializationsStore = skillStoreManager.GetRWStore("languageSkill.specializations");

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
      <div class="skill-background-layer"></div>

      <h6 class="no-margin skill-name">{skill.name}</h6>

      <div class="skill-main-container">
         <h1 class="skill-value">{$valueStore}</h1>
      </div>

      {#if $readWriteStore > 0}
         <div class="specialization-container">
            <div class="skill-specialization-card">
               <div class="specialization-background"></div>
               <div class="specialization-name">Read/Write</div>
               <h1 class="embedded-value">{$readWriteStore}</h1>
            </div>
         </div>
      {/if}

      {#if $specializationsStore.length > 0}
         <div class="specialization-container">
            {#each $specializationsStore as specialization}
               <div class="skill-specialization-card">
                  <div class="specialization-background"></div>
                  <div class="specialization-name">{specialization.name}</div>
                  <h1 class="embedded-value">{specialization.value}</h1>
               </div>
            {/each}
         </div>
      {/if}
   </div>
</div>
