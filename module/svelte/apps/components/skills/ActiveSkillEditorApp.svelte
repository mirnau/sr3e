<script>
   import { openFilePicker, localize } from "@services/utilities.js";
   import SpecializationCard from "./SpecializationCard.svelte";
   import { onDestroy, tick } from "svelte";
   import { flags } from "@services/commonConsts.js";
   import { get, set } from "svelte/store";
   import KarmaShoppingService from "@services/KarmaShoppingService.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import Karma from "../Karma.svelte";
   import { onMount } from "svelte";

   let { skill, actor, config, app } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   let itemStoreManager = StoreManager.Subscribe(skill);

   let specializationsStore = itemStoreManager.GetRWStore("activeSkill.specializations");
   let activeSkillPointsStore = actorStoreManager.GetRWStore("creation.activePoints");
   let valueStore = itemStoreManager.GetRWStore("activeSkill.value");

   let karmaShoppingService = null;

   onMount(() => {
      karmaShoppingService ??= new KarmaShoppingService(skill);
   });

   onDestroy(() => {
      karmaShoppingService = null;
   });

   let isCharacterCreationStore = actorStoreManager.GetFlagStore(flags.actor.isCharacterCreation);

   let disableValueControls = $derived($isCharacterCreationStore && $specializationsStore.length > 0);

   let layoutMode = $state("single");

   let linkedAttribute = skill.system.activeSkill.linkedAttribute;
   let linkedAttributeRating = $state(
      Number(foundry.utils.getProperty(actor, `system.attributes.${linkedAttribute}.value`)) +
         Number(foundry.utils.getProperty(actor, `system.attributes.${linkedAttribute}.mod`))
   );

   let attributeAssignmentLockedStore = actorStoreManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   async function addNewSpecialization() {
      let newSkillSpecialization;

      if (actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
         if ($specializationsStore.length > 0) {
            ui.notifications.info(localize(config.skill.onlyonespecializationatcreation));
            return;
         }

         newSkillSpecialization = {
            name: localize(config.skill.newspecialization),
            value: $valueStore + 1,
         };

         $valueStore -= 1;
      } else {
         console.log("TODO: create a addSpecialization procedure for Karma");
      }

      if (newSkillSpecialization) {
         $specializationsStore.push(newSkillSpecialization);
         $specializationsStore = [...$specializationsStore];
      }
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

               if ($activeSkillPointsStore >= costForNextLevel) {
                  $valueStore += 1;
                  $activeSkillPointsStore -= costForNextLevel;

                  if ($valueStore === linkedAttributeRating) {
                     ui.notifications.info(config.notifications.skillpricecrossedthreshold);
                  }
               }
            }
         } else {
            karmaShoppingService = new KarmaShoppingService(skill);

            console.log("TODO: implement karma based shopping");
         }
      } else {
         ui.notifications.warn(localize(config.notifications.assignattributesfirst));
      }
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
               $activeSkillPointsStore += refundForCurrentLevel;
            }
         } else {
            console.log("TODO: implement karma based shopping");
         }
      } else {
         ui.notifications.warn(localize(config.notifications.assignattributesfirst));
      }
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

            $activeSkillPointsStore += refund;
            $valueStore = 0;

            ui.notifications.info(localize(config.notifications.skillpointsrefund));
         }

         await tick();

         if (skill) {
            const id = skill.id;
            await actor.deleteEmbeddedDocuments("Item", [id], {
               render: false,
            });

            const store = storeManager.getActorStore(actor.id, stores.activeSkillsIds);
            const current = get(store);
            store.set(current.filter((sid) => sid !== id));
         }

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
                     <div class="buttons-vertical-distribution">
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Toggle card span"
                           onclick={increment}
                           disabled={disableValueControls}
                        >
                           <i class="fa-solid fa-plus"></i>
                        </button>
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Toggle card span"
                           onclick={decrement}
                           disabled={disableValueControls}
                        >
                           <i class="fa-solid fa-minus"></i>
                        </button>

                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Toggle card span"
                           onclick={deleteThis}
                        >
                           <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <button
                           class="header-control icon sr3e-toolbar-button"
                           aria-label="Toggle card span"
                           onclick={addNewSpecialization}
                           disabled={$valueStore <= 1}
                        >
                           {localize(config.skill.addspecialization)}
                        </button>
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
                  {localize(config.skill.specializations)}
               </h1>
               <div class="stat-grid single-column">
                  {#each $specializationsStore as specialization, i}
                     <SpecializationCard
                        bind:specialization={$specializationsStore[i]}
                        {actor}
                        {skill}
                        on:arrayChanged={() => {
                           $specializationsStore = [...$specializationsStore];
                           console.log("array was reassigned");
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
