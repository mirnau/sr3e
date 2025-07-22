<script>
   import { openFilePicker, localize } from "@services/utilities.js";
   import SpecializationCard from "./SpecializationCard.svelte";
   import { onDestroy, tick } from "svelte";
   import { flags } from "@services/commonConsts.js";
   import { get, set } from "svelte/store";
   import { StoreManager, stores } from "@sveltehelpers/StoreManager.svelte.js";

   let { skill, actor, config, app } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   let itemStoreManager = StoreManager.Subscribe(skill);

   let specializationsStore = itemStoreManager.GetRWStore("languageSkill.specializations");
   let valueStore = itemStoreManager.GetRWStore("languageSkill.value");
   let languageSkillPointsStore = actorStoreManager.GetRWStore("creation.languagePoints");

   let isCharacterCreationStore = actorStoreManager.GetFlagStore(flags.actor.isCharacterCreation);

   const languageSkillsIdArrayStore = actorStoreManager.GetShallowStore(
      actor.id,
      stores.languageSkillsIds,
      actor.items.filter((item) => item.type === "skill" && item.system.skillType === "language").map((item) => item.id)
   );

   let layoutMode = $state("single");

   let linkedAttribute = skill.system.languageSkill.linkedAttribute;
   let linkedAttributeRating = $state(
      Number(foundry.utils.getProperty(actor, `system.attributes.${linkedAttribute}.value`)) +
         Number(foundry.utils.getProperty(actor, `system.attributes.${linkedAttribute}.mod`))
   );

   let attributeAssignmentLockedStore = actorStoreManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   let readWrite = $derived($valueStore <= 1 ? 0 : Math.floor($valueStore / 2));
   let disableValueControls = $derived($isCharacterCreationStore && $specializationsStore.length > 0);

   $effect(() => {
      skill.update({ "system.languageSkill.specializations": $specializationsStore }, { render: false });
      skill.update({ "system.languageSkill.readwrite.value": readWrite }, { render: false });
   });

   async function addNewSpecialization() {
      if (!$specializationsStore) throw new Error("Cannot add lingo: specialization store is null");

      if (actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
         if ($specializationsStore.length > 0) {
            ui.notifications.info(localize(config.skill.onlyonespecializationatcreation));
            return;
         }
         $specializationsStore.push({
            name: localize(config.skill.newspecialization),
            value: $valueStore + 1,
         });
         $valueStore -= 1;
      } else {
         $specializationsStore.push({
            name: localize(config.skill.newspecialization),
            value: 0,
         });
      }
      $specializationsStore = [...$specializationsStore];
      await skill.update({ "system.languageSkill.specializations": $specializationsStore }, { render: false });
   }

   async function increment() {
      if ($attributeAssignmentLockedStore) {
         if ($isCharacterCreationStore) {
            if ($valueStore < 6) {
               let costForNextLevel;

               if ($valueStore < linkedAttributeRating) {
                  costForNextLevel = 1;
               } else {
                  costForNextLevel = 2;
               }

               if ($languageSkillPointsStore >= costForNextLevel) {
                  $valueStore += 1;
                  $languageSkillPointsStore -= costForNextLevel;

                  if ($valueStore === linkedAttributeRating) {
                     ui.notifications.info(config.notifications.skillpricecrossedthreshold);
                  }
               }
            }
         } else {
            console.log("TODO: implement karma based shopping");
         }
      } else {
         ui.notifications.warn(localize(config.notifications.assignattributesfirst));
      }

      silentUpdate();
   }

   async function decrement() {
      if ($attributeAssignmentLockedStore) {
         if ($isCharacterCreationStore) {
            if ($valueStore > 0) {
               let refundForCurrentLevel;

               if ($valueStore > linkedAttributeRating) {
                  refundForCurrentLevel = 2;
               } else {
                  refundForCurrentLevel = 1;
               }

               $valueStore -= 1;
               $languageSkillPointsStore += refundForCurrentLevel;
            }
         } else {
            console.log("TODO: implement karma based shopping");
         }
      } else {
         ui.notifications.warn(localize(config.notifications.assignattributesfirst));
      }

      await silentUpdate();
   }

   async function silentUpdate() {
      await skill.update(
         {
            "system.languageSkill.value": $valueStore,
            "system.languageSkill.readwrite.value": readWrite,
         },
         { render: false }
      );

      await actor.update({ "system.creation.languagePoints": $languageSkillPointsStore }, { render: false });
   }

   async function deleteThis() {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
         window: {
            title: localize(config.modal.deleteskilltitle),
         },
         content: localize(config.modal.deleteskill),
         yes: {
            label: localize(config.modal.confirm),
            default: true,
         },
         no: {
            label: localize(config.modal.decline),
         },
         modal: true,
         rejectClose: true,
      });

      if (confirmed) {
         if ($isCharacterCreationStore) {
            if ($specializationsStore.length > 0) {
               $specializationsStore = [];
               await tick();
               $valueStore += 1;
            }

            let refund = 0;
            for (let i = 1; i <= $valueStore; i++) {
               refund += i <= linkedAttributeRating ? 1 : 2;
            }

            $languageSkillPointsStore += refund;
            $valueStore = 0;

            ui.notifications.info(localize(config.skill.skillpointsrefund));
         }

         await tick();

         const id = skill.id;
         await actor.deleteEmbeddedDocuments("Item", [id], {
            render: false,
         });

         const store = storeManager.getActorStore(actor.id, stores.languageSkillsIds);
         store.set(get(store).filter((sid) => sid !== id));

         app.close();
      }
   }

   function deleteSpecialization(event) {
      const toDelete = event.detail.specialization;
      $specializationsStore = $specializationsStore.filter((s) => s !== toDelete);
      $valueStore += 1;
   }
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
      <div class="item-sheet-component">
         <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
               <div class="image-mask">
                  <img
                     src={skill.img}
                     role="presentation"
                     data-edit="img"
                     title={skill.name}
                     alt={skill.name}
                     onclick={async () => openFilePicker(actor)}
                  />
               </div>
               <div class="stat-grid single-column">
                  <div class="stat-card">
                     <div class="stat-card-background"></div>
                     <h1>{skill.name}</h1>
                  </div>

                  <div class="stat-card">
                     <div class="stat-card-background"></div>
                     <h1>{$valueStore}</h1>
                  </div>

                  <div class="stat-card">
                     <div class="stat-card-background"></div>
                     <div class="skill-specialization-card">
                        <div class="specialization-background"></div>
                        <h6>
                           {localize(config.skill.readwrite)}:
                        </h6>
                        <h1 class="embedded-value">
                           {readWrite}
                        </h1>
                     </div>
                  </div>

                  <div class="stat-card">
                     <div class="stat-card-background"></div>
                     <div class="buttons-vertical-distribution">
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Increase"
                           onclick={increment}
                           disabled={disableValueControls}><i class="fa-solid fa-plus"></i></button
                        >
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Decrease"
                           onclick={decrement}
                           disabled={disableValueControls}><i class="fa-solid fa-minus"></i></button
                        >
                        <button class="header-control icon sr3e-toolbar-button" aria-label="Delete" onclick={deleteThis}
                           ><i class="fa-solid fa-trash-can"></i></button
                        >
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Add Spec"
                           onclick={addNewSpecialization}
                           disabled={$valueStore <= 1}>{localize(config.skill.addlingo)}</button
                        >
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="item-sheet-component">
         <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
               <h1 class="uppercase">
                  {localize(config.skill.lingos)}
               </h1>
               <div class="stat-grid single-column">
                  {#each $specializationsStore as specialization, i}
                     <SpecializationCard
                        bind:specialization={$specializationsStore[i]}
                        {actor}
                        {skill}
                        on:arrayChanged={() => {
                           $specializationsStore = [...$specializationsStore];
                        }}
                        on:delete={deleteSpecialization}
                     />
                  {/each}
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
