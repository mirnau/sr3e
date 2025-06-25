<script>
  import { localize } from "../../../../services/utilities.js";
  import { flags } from "../../../../services/commonConsts.js";
  import { getActorStore, stores } from "../../../stores/actorStores.js";
  import CreationPointList from "../../components/CreationPointList.svelte";

  let { actor = {}, config = {} } = $props();

  let system = $state(actor.system);

  let attributePointsStore = actor.getStore(
    "creation.attributePoints",
    system.creation.attributePoints
  );

  let activeSkillPointsStore = actor.getStore("creation.activePoints");
  let knowledgePointsStore = actor.getStore("creation.knowledgePoints");
  let languagePointsStore = actor.getStore("creation.languagePoints");

  let isCharacterCreation = getActorStore(
    actor.id,
    stores.isCharacterCreation,
    actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)
  );

  let attributePointsText = localize(config.attributes.attributes);
  let activePointsText = localize(config.skill.active);
  let knowledgePointsText = localize(config.skill.knowledge);
  let languagePointsText = localize(config.skill.language);

  // Make pointList reactive by using derived stores
  let pointList = $derived([
    { value: $attributePointsStore, text: attributePointsText },
    { value: $activeSkillPointsStore, text: activePointsText },
    { value: $knowledgePointsStore, text: knowledgePointsText },
    { value: $languagePointsStore, text: languagePointsText },
  ]);

  $effect(() => {
    if (
      $activeSkillPointsStore === 0 &&
      $knowledgePointsStore === 0 &&
      $languagePointsStore === 0
    ) {
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
</script>

<CreationPointList points={pointList} containerCSS={"skill-point-assignment"} />
