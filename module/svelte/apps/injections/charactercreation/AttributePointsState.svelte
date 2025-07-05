<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import CreationPointList from "../../components/CreationPointList.svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { actor, config } = $props();

   let attributePointsText = localize(config.attributes.attributes);
   let activePointsText = localize(config.skill.active);
   let knowledgePointsText = localize(config.skill.knowledge);
   let languagePointsText = localize(config.skill.language);
   let storeManager = StoreManager.Subscribe(actor);

   let attributeAssignmentLocked = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   let intelligence = storeManager.GetSumROStore("attributes.intelligence");
   let attributePointsStore = storeManager.GetRWStore("creation.attributePoints");
   let activeSkillPointsStore = storeManager.GetRWStore("creation.activePoints");
   let knowledgePointsStore = storeManager.GetRWStore("creation.knowledgePoints");
   let languagePointsStore = storeManager.GetRWStore("creation.languagePoints");

   console.log("NEW ACTOR", actor);

   // Make pointList reactive by using derived stores
   let pointList = $derived([
      { value: $attributePointsStore, text: attributePointsText },
      { value: $activeSkillPointsStore, text: activePointsText },
      { value: $knowledgePointsStore, text: knowledgePointsText },
      { value: $languagePointsStore, text: languagePointsText },
   ]);

   // Update dependent values when intelligence changes
   $effect(() => {
      knowledgePointsStore.set($intelligence.sum * 5);
      languagePointsStore.set(Math.floor($intelligence.sum * 1.5));
   });

   $effect(() => {
      if ($attributePointsStore === 0 && $attributeAssignmentLocked === false) {
         (async () => {
            const confirmed = await foundry.applications.api.DialogV2.confirm({
               window: {
                  title: localize(config.modal.exitattributesassignment),
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
               actor.setFlag(flags.sr3e, flags.actor.attributeAssignmentLocked, true);
               $attributeAssignmentLocked = true;
            }
         })();
      }
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CreationPointList points={pointList} containerCSS={"attribute-point-assignment"} />
