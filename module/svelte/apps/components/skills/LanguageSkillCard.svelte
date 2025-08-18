<script>
   import { localize } from "@services/utilities.js";
   import { flags } from "@services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
   import { mount, unmount } from "svelte";
   import { onDestroy } from "svelte";

   let { skill = {}, actor = {}, config = {} } = $props();

   let skillStoreManager = StoreManager.Subscribe(skill);
   let actorStoreManager = StoreManager.Subscribe(actor);

   let valueStore = skillStoreManager.GetRWStore("languageSkill.value");
   let readWriteStore = skillStoreManager.GetRWStore("languageSkill.readwrite.value");
   let specializationsStore = skillStoreManager.GetRWStore("languageSkill.specializations");

   let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);

   let isModalOpen = $state(false);
   let activeModal = null;

   function openSkill() {
      ActiveSkillEditorSheet.launch(actor, skill, config);
   }

   async function Roll(e, skillId, specializationName = null) {
      const dice = specializationName
         ? $specializationsStore.find((s) => s.name === specializationName)?.value
         : $valueStore;

      if (e.shiftKey) {
         actor.sheet.displayRollComposer({
            type: "skill",
            key: skill.name,
            dice,
            value: dice,
            skillId,
            specialization: specializationName,
            name: skill.name,
         });
      } else {
         if (specializationName) {
            await actor.SpecializationRoll(dice, specializationName);
         } else {
            await actor.SkillRoll(dice, skill.name);
         }
      }

      e.preventDefault();
   }

   onDestroy(() => {
      StoreManager.Unsubscribe(skill);
   });

   function handleEscape(e) {
      if (e.key === "Escape" && activeModal) {
         e.preventDefault();
         e.stopImmediatePropagation();
         e.stopPropagation();
         unmount(activeModal);
         isModalOpen = false;
         activeModal = null;
      }
   }
</script>

<svelte:window on:keydown|capture={handleEscape} />

<div class="skill-card-container" data-item-id="{skill.id}">
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

      <div
         class="skill-main-container button"
         role="button"
         tabindex="0"
         onclick={(e) => Roll(e, skill.id, "language", skill.name, $valueStore)}
         onkeydown={(e) =>
            (e.key === "Enter" || e.key === " ") && Roll(e, skill.id, "language", skill.name, $valueStore)}
      >
         <h1 class="skill-value">{$valueStore}</h1>
      </div>

      {#if $readWriteStore > 0}
         <div class="specialization-container">
            <div
               class="skill-specialization-card button"
               role="button"
               tabindex="0"
               onclick={(e) => Roll(e, skill.id, "language", "Read/Write", $readWriteStore)}
               onkeydown={(e) =>
                  (e.key === "Enter" || e.key === " ") && Roll(e, skill.id, "language", "Read/Write", $readWriteStore)}
            >
               <div class="specialization-background"></div>
               <div class="specialization-name">Read/Write</div>
               <h1 class="embedded-value">{$readWriteStore}</h1>
            </div>
         </div>
      {/if}

      {#if $specializationsStore.length > 0}
         <div class="specialization-container">
            {#each $specializationsStore as specialization}
               <div
                  class="skill-specialization-card button"
                  role="button"
                  tabindex="0"
                  onclick={(e) => Roll(e, skill.id, "specialization", specialization.name, specialization.value)}
                  onkeydown={(e) =>
                     (e.key === "Enter" || e.key === " ") &&
                     Roll(e, skill.id, "specialization", specialization.name, specialization.value)}
               >
                  <div class="specialization-background"></div>
                  <div class="specialization-name">{specialization.name}</div>
                  <h1 class="embedded-value">{specialization.value}</h1>
               </div>
            {/each}
         </div>
      {/if}
   </div>
</div>
