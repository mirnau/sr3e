<script>
   import { localize } from "@services/utilities.js";
   import { flags } from "@services/commonConsts.js";
   import ActiveSkillEditorSheet from "../../../../foundry/applications/SkillEditorApp.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
   import { mount, unmount } from "svelte";
   import { onDestroy } from "svelte";
   import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";
   import UncontestedSkillProcedure from "@services/procedure/FSM/UncontestedSkillProcedure.js";

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
      const arr = $specializationsStore;
      const specIndex = specializationName ? arr.findIndex((s) => s.name === specializationName) : null;
      const dice = specializationName ? (arr?.[specIndex]?.value ?? 0) : $valueStore;

      const basis = { type: "skill", id: skillId, dice, specIndex };

      const id = ProcedureLock.assertEnter({
         ownerKey: `uncontested-skill:${actor.id}`,
         priority: "simple",
         onDenied: () => Hooks.callAll("sr3e:procedure-basis-override", { actorId: actor.id, basis }),
      });
      if (!id) {
         e.preventDefault();
         return;
      }

      try {
         const proc = new UncontestedSkillProcedure(actor, null, { skillId, specIndex, title: skill.name });
         if (e.shiftKey) actor.sheet.displayRollComposer(proc);
         else await proc.execute();
      } finally {
         ProcedureLock.release(id);
      }

      e.preventDefault();
   }

   onDestroy(() => {
      StoreManager.Unsubscribe(skill);
      StoreManager.Unsubscribe(actor);
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

<div class="skill-card-container" data-item-id={skill.id}>
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
