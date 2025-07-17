<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import RollComposerComponent from "../../components/RollComposerComponent.svelte";
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

   async function Roll(e, skillId, specializationName = null) {
      if (e.shiftKey) {
         if (isModalOpen) return;
         isModalOpen = true;

         const rollType = specializationName ? "specialization" : "skill";
         const rollName = specializationName || skill.name;
         const dice = specializationName ? $specializations.find((s) => s.name === specializationName)?.value : $value;

         const options = await new Promise((resolve) => {
            activeModal = mount(RollComposerComponent, {
               target: document.querySelector(".composer-position"),
               props: {
                  actor,
                  config,
                  caller: {
                     key: rollName,
                     type: rollType,
                     dice,
                     skillId,
                  },
                  onclose: (result) => {
                     unmount(activeModal);
                     isModalOpen = false;
                     activeModal = null;
                     resolve(result);
                  },
               },
            });
         });

         if (options) {
            if (specializationName) {
               await actor.SpecializationRoll(options.dice, specializationName.name, options.options);
            } else {
               await actor.SkillRoll(options.dice, skill.name, options.options);
            }
         }
      } else {
         if (specializationName) {
            const specValue = $specializations.find((s) => s.name === specializationName)?.value;
            await actor.SpecializationRoll(specValue, skill.name);
         } else {
            await actor.SkillRoll($value, skill.name);
         }
      }

      e.preventDefault();
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
