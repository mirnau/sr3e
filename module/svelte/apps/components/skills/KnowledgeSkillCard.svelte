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

   let value = skillStoreManager.GetRWStore("knowledgeSkill.value");
   let specializations = skillStoreManager.GetRWStore("knowledgeSkill.specializations");

   let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);

   let isModalOpen = $state(false);
   let activeModal = null;

   function openSkill() {
      ActiveSkillEditorSheet.launch(actor, skill, config);
   }

   async function Roll() {
      const actor = item.parent;
      const skillData = item.system.activeSkill;
      const skillName = item.name;

      // Determine total dice
      const specIndex = parseInt(selectedSpecializationIndex);
      const spec = skillData.specializations?.[specIndex];
      const dice = spec ? spec.value : skillData.value;
      const specializationName = spec?.name;

      const caller = {
         key: spec ? `${skillName} - ${specializationName}` : skillName,
         value: 0,
         type: spec ? "specialization" : "skill",
         dice,
         skillId: item.id,
         specialization: spec,
      };

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(dice, { explodes: false }),
         { actor },
         {
            skillName,
            specializationName,
            attributeName: skillData.linkedAttribute,
            callerType: caller.type,
            opposed: game.user.targets.size > 0,
         }
      );

      await roll.evaluate();
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
            <h1 class="skill-value">{$value}</h1>
         </div>

         {#if $specializations.length > 0}
            <div class="specialization-container">
               {#each $specializations as specialization}
                  <div class="skill-specialization-card">
                     <div class="specialization-background"></div>
                     <div class="specialization-name">{specialization.name}</div>
                     <h1 class="embedded-value">{specialization.value}</h1>
                  </div>
               {/each}
            </div>
         {/if}
      </div>
   {:else}
      <div class="skill-card">
         <div class="skill-background-layer"></div>

         <h6 class="no-margin skill-name">{skill.name}</h6>

         <div
            class="skill-main-container button"
            role="button"
            tabindex="0"
            onclick={(e) => Roll(e, skill.id)}
            onkeydown={(e) => {
               if (e.key === "Enter" || e.key === " ") Roll(e, skill.id);
            }}
         >
            <h1 class="skill-value">{$value}</h1>
         </div>

         {#if $specializations.length > 0}
            <div class="specialization-container">
               {#each $specializations as specialization}
                  <div
                     class="skill-specialization-card"
                     class:button={!$isShoppingState}
                     role="button"
                     tabindex="0"
                     onclick={(e) => Roll(e, skill.id, specialization.name)}
                     onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") Roll(e, skill.id, specialization.name);
                     }}
                  >
                     <div class="specialization-background"></div>
                     <div class="specialization-name">{specialization.name}</div>
                     <h1 class="embedded-value">{specialization.value}</h1>
                  </div>
               {/each}
            </div>
         {/if}
      </div>
   {/if}
</div>
