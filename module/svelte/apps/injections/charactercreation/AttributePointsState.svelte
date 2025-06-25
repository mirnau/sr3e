<script>
  import { localize } from "../../../../services/utilities.js";
  import { flags } from "../../../../services/commonConsts.js";
  import { getActorStore, stores } from "../../../stores/actorStores.js";
  import CreationPointList from "../../components/CreationPointList.svelte";

  let { actor, config } = $props();
  let system = $state(actor.system);

  let attributeAssignmentLocked = getActorStore(
    actor.id,
    stores.attributeAssignmentLocked,
    actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked)
  );

  // Store retrieval with lazy init
  let intelligenceMod = actor.getStore("attributes.intelligence.mod");
  let intelligenceMeta = actor.getStore("attributes.intelligence.meta");
  let intelligenceValue = actor.getStore("attributes.intelligence.value");
  let intelligence = $derived(
    $intelligenceValue + $intelligenceMod + $intelligenceMeta
  );

  let attributePointsStore = actor.getStore("creation.attributePoints");
  let activeSkillPoints = actor.getStore("creation.activePoints");
  let knowledgePointStore = actor.getStore("creation.knowledgePoints");
  let languagePointStore = actor.getStore("creation.languagePoints");

  let attributePointsText = localize(config.attributes.attributes);
  let activePointsText = localize(config.skill.active);
  let knowledgePointsText = localize(config.skill.knowledge);
  let languagePointsText = localize(config.skill.language);

  // Make pointList reactive by using derived stores
  let pointList = $derived([
    { value: $attributePointsStore, text: attributePointsText },
    { value: $activeSkillPoints, text: activePointsText },
    { value: $knowledgePointStore, text: knowledgePointsText },
    { value: $languagePointStore, text: languagePointsText },
  ]);

  // Update dependent values when intelligence changes
  $effect(() => {
    knowledgePointStore.set(intelligence * 5);
    languagePointStore.set(Math.floor(intelligence * 1.5));
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
          actor.setFlag(
            flags.sr3e,
            flags.actor.attributeAssignmentLocked,
            true
          );
          $attributeAssignmentLocked = true;
        }
      })();
    }
  });
</script>

<CreationPointList
  points={pointList}
  containerCSS={"attribute-point-assignment"}
/>
