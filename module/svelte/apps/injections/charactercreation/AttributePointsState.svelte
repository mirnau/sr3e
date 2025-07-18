<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import CreationPointList from "../../components/CreationPointList.svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { actor, config } = $props();

   const attributePointsText = localize(config.attributes.attributes);
   const activePointsText = localize(config.skill.active);
   const knowledgePointsText = localize(config.skill.knowledge);
   const languagePointsText = localize(config.skill.language);

   const storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   const attributeAssignmentLocked = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   const intelligence = storeManager.GetRWStore("attributes.intelligence");
   const attributePointsStore = storeManager.GetRWStore("creation.attributePoints");
   const activeSkillPointsStore = storeManager.GetRWStore("creation.activePoints");
   const knowledgePointsStore = storeManager.GetRWStore("creation.knowledgePoints");
   const languagePointsStore = storeManager.GetRWStore("creation.languagePoints");

   const pointList = $derived([
      { value: $attributePointsStore, text: attributePointsText },
      { value: $activeSkillPointsStore, text: activePointsText },
      { value: $knowledgePointsStore, text: knowledgePointsText },
      { value: $languagePointsStore, text: languagePointsText },
   ]);

   $effect(() => {
      $knowledgePointsStore = $intelligence * 5;
      $languagePointsStore = Math.floor($intelligence * 1.5);
   });

   $effect(() => {
      if ($attributePointsStore === 0 && !$attributeAssignmentLocked) {
         (async () => {
            const confirmed = await foundry.applications.api.DialogV2.confirm({
               window: {
                  title: localize(config.modal.exitattributesassignment),
               },
               content: localize(config.modal.exitattributesassignment),
               yes: { label: localize(config.modal.confirm), default: true },
               no: { label: localize(config.modal.decline) },
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
</script>

<CreationPointList points={pointList} containerCSS="attribute-point-assignment" />
