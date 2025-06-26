<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { getActorStore, stores } from "../../../stores/actorStores.js";
   import CreationPointList from "../../components/CreationPointList.svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {} } = $props();

   let attributePointsText = localize(config.attributes.attributes);
   let activePointsText = localize(config.skill.active);
   let knowledgePointsText = localize(config.skill.knowledge);
   let languagePointsText = localize(config.skill.language);

   let storeManager = StoreManager.Subscribe(actor);
   let activeSkillPointsStore = storeManager.GetStore("creation.activePoints");
   let knowledgePointStore = storeManager.GetStore("creation.knowledgePoint");
   let languagePointStore = storeManager.GetStore("creation.languagePoint");

   let isCharacterCreation = getActorStore(
      actor.id,
      stores.isCharacterCreation,
      actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)
   );

   // Make pointList reactive by using derived stores
   let pointList = $derived([
      { value: 0, text: attributePointsText },
      { value: $activeSkillPointsStore, text: activePointsText },
      { value: $knowledgePointStore, text: knowledgePointsText },
      { value: $languagePointStore, text: languagePointsText },
   ]);

   $effect(() => {
      if ($activeSkillPointsStore === 0 && $knowledgePointStore === 0 && $languagePointStore === 0) {
         (async () => {
            const confirmed = await foundry.applications.api.DialogV2.confirm({
               window: {
                  title: localize(config.modal.exitcreationmodetitle),
               },
               content: localize(config.modal.exitcreationmode),
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
               actor.setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
               $isCharacterCreation = false;
            }
         })();
      }
   });
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CreationPointList points={pointList} containerCSS={"skill-point-assignment"} />
