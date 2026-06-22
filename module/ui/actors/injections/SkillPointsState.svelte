<script lang="ts">
   import { untrack } from "svelte";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { FLAGS } from "../../../constants/flags";
   import CreationPointList from "../../common-components/CreationPointList.svelte";

   const { actor: _actor } = $props<{ actor: Actor; config?: any }>();
   const actor = untrack(() => _actor);
   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
   const activePoints = storeManager.GetRWStore<number>(actor, "creation.activePoints");
   const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
   const languagePoints = storeManager.GetRWStore<number>(actor, "creation.languagePoints");
   const isCharacterCreation = storeManager.GetFlagStore(
      actor,
      FLAGS.ACTOR.IS_CHARACTER_CREATION,
      false,
   );

   const pointList = $derived([
      {
         value: 0,
         text: "Attribute Points",
      },
      {
         value: $activePoints,
         text: "Active Skills",
      },
      {
         value: $knowledgePoints,
         text: "Knowledge Skills",
      },
      {
         value: $languagePoints,
         text: "Language Skills",
      },
   ]);
   $effect(() => {
      if (
         $activePoints === 0 &&
         $knowledgePoints === 0 &&
         $languagePoints === 0 &&
         $isCharacterCreation
      ) {
         (async () => {
            const confirmed = await Dialog.confirm({
               title: "Finish Character Creation?",
               content: "<p>You have spent all your skill points.</p><p>Finish character creation?</p>",
            });

            if (confirmed) {
               await isCharacterCreation.update(() => false);
            }
         })();
      }
   });
</script>

<CreationPointList points={pointList} containerCSS="skill-point-assignment" />
