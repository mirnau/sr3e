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

   let valueStore = skillStoreManager.GetRWStore("activeSkill.value");
   let specializationsStore = skillStoreManager.GetRWStore("activeSkill.specializations");

   let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);

   let activeModal = null;

   function openSkill() {
      ActiveSkillEditorSheet.launch(actor, skill, config);
   }

   async function Roll(e, skillId, specializationName = null) {
      if (e.shiftKey) {
         if (activeModal) return;

         let resolveModal;
         const modalPromise = new Promise((resolve) => (resolveModal = resolve));

         activeModal = mount(RollComposerComponent, {
            target: document.querySelector(".composer-position"),
            props: {
               actor,
               config,
               caller: {
                  key: skill.name,
                  type: "skill",
                  dice: specializationName
                     ? $specializationsStore.find((s) => s.name === specializationName)?.value
                     : $valueStore,
                  skillId,
                  specialization: specializationName,
                  name: skill.name,
               },
               onclose: (result) => resolveModal(result),
            },
         });

         const result = await modalPromise;

         // Component stays mounted until roll resolution completes
         unmount(activeModal);
         activeModal = null;

         // Optional: handle the result
         if (result) {
            console.log("Roll completed", result);
         }

         return;
      }

      // Normal (non-shift) roll
      if (specializationName) {
         const specValue = $specializationsStore.find((s) => s.name === specializationName)?.value;
         await actor.SpecializationRoll(specValue, specializationName);
      } else {
         await actor.SkillRoll($valueStore, skill.name);
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
            <h1 class="skill-value">{$valueStore}</h1>
         </div>

         {#if $specializationsStore.length > 0}
            <div class="specialization-container">
               {#each $specializationsStore as specialization}
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
