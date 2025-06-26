<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { getActorStore, stores } from "../../../stores/actorStores.js";
   import CreationPointList from "../../components/CreationPointList.svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { actor, config } = $props();

   let attributePointsText = localize(config.attributes.attributes);
   let activePointsText = localize(config.skill.active);
   let knowledgePointsText = localize(config.skill.knowledge);
   let languagePointsText = localize(config.skill.language);

   let attributeAssignmentLocked = getActorStore(
      actor.id,
      stores.attributeAssignmentLocked,
      actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked)
   );

   let storeManager = StoreManager.Subscribe(actor);

   let intelligence = storeManager.GetCompositeStore("attributes.intelligence", ["value", "mod", "meta"]);
   let attributePointStore = storeManager.GetStore("creation.attributePoints");
   let activeSkillPoints = storeManager.GetStore("creation.activePoints");
   let knowledgePointStore = storeManager.GetStore("creation.knowledgePoint");
   let languagePointStore = storeManager.GetStore("creation.languagePoint");

   // Make pointList reactive by using derived stores
   let pointList = $derived([
      { value: $attributePointStore, text: attributePointsText },
      { value: $activeSkillPoints, text: activePointsText },
      { value: $knowledgePointStore, text: knowledgePointsText },
      { value: $languagePointStore, text: languagePointsText },
   ]);

   // Update dependent values when intelligence changes
   $effect(() => {
      knowledgePointStore.set($intelligence.sum * 5);
      languagePointStore.set(Math.floor($intelligence.sum * 1.5));
   });

   $effect(() => {
      if ($attributePointStore === 0 && $attributeAssignmentLocked === false) {
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
