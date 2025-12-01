<script lang="ts">
   import { localize } from "@services/utilities.js";
   import { flags } from "@services/commonConsts.js";
   import CreationPointList from "@sveltecomponent/CreationPointList.svelte";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import { onDestroy, tick } from "svelte";

   let { actor, config } = $props();

   let attributePointsText = localize(config.attributes.attributes);
   let activePointsText = localize(config.skill.active);
   let knowledgePointsText = localize(config.skill.knowledge);
   let languagePointsText = localize(config.skill.language);
   let storeManager = StoreManager.Subscribe(actor);

   let attributeAssignmentLocked = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   // Shared guard to prevent multiple prompts per actor
   let creationPromptGuard = storeManager.GetShallowStore(actor.id, "creationAttributePromptShown", false);

   let intelligence = storeManager.GetSumROStore("attributes.intelligence");
   let attributePreview = storeManager.GetShallowStore(actor.id, "shoppingAttributePreview", { active: false, values: {} });
   let attributePointsStore = storeManager.GetRWStore("creation.attributePoints");
   let activeSkillPointsStore = storeManager.GetRWStore("creation.activePoints");
   let knowledgePointsStore = storeManager.GetRWStore("creation.knowledgePoints");
   let languagePointsStore = storeManager.GetRWStore("creation.languagePoints");

   DEBUG && LOG.inspect("NEW ACTOR", [__FILE__, __LINE__], actor);
   // Guard to prevent double-prompting when attr points hit 0
   let promptInFlight = false;

   // Make pointList reactive by using derived stores
   let pointList = $derived([
      { value: $attributePointsStore, text: attributePointsText },
      { value: $activeSkillPointsStore, text: activePointsText },
      { value: $knowledgePointsStore, text: knowledgePointsText },
      { value: $languagePointsStore, text: languagePointsText },
   ]);

   // Update dependent values when Intelligence changes (use preview during shopping)
   $effect(() => {
      const intSum = $isShoppingState ? ($attributePreview?.values?.intelligence ?? $intelligence.sum) : $intelligence.sum;
      knowledgePointsStore.set((intSum ?? 0) * 5);
      languagePointsStore.set(Math.floor((intSum ?? 0) * 1.5));
   });

   $effect(() => {
      if ($attributePointsStore === 0 && $attributeAssignmentLocked === false && !promptInFlight && !$creationPromptGuard) {
         promptInFlight = true;
         creationPromptGuard.set(true);
         (async () => {
            const confirmed = await foundry.applications.api.DialogV2.confirm({
               window: {
                  title: localize(config.modal.exitattributesassignmenttitle),
               },
               content: localize(config.modal.exitattributesassignment),
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
               // Flip shopping off to commit all staged attribute sessions while cards are mounted
               $isShoppingState = false;
               await tick();

               // Lock attribute assignment (switch UI to skills)
               await actor.setFlag(flags.sr3e, flags.actor.attributeAssignmentLocked, true);
               $attributeAssignmentLocked = true;

               // Re-enable shopping for the skills phase
               $isShoppingState = true;
            }
            promptInFlight = false;
         })();
      }
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CreationPointList points={pointList} containerCSS={"attribute-point-assignment"} />








