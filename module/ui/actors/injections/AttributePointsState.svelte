<script lang="ts">
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { FLAGS } from "../../../constants/flags";
   import CreationPointList from "../../common-components/CreationPointList.svelte";

   const { actor, config = CONFIG.SR3E } = $props<{ actor: Actor; config?: any }>();
   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
   const creationPointsStore = storeManager.GetRWStore<number>(actor, "creation.attributePoints");
   const activePoints = storeManager.GetRWStore<number>(actor, "creation.activePoints");
   const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
   const languagePoints = storeManager.GetRWStore<number>(actor, "creation.languagePoints");
   const intelligenceStore = storeManager.GetRWStore<number>(actor, "attributes.intelligence.value");
   const attributeLocked = storeManager.GetFlagStore(
      actor,
      FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
      false,
   );

   const pointList = $derived([
      { value: $creationPointsStore, text: "Attribute Points" },
      { value: $activePoints,        text: "Active Skills"    },
      { value: $knowledgePoints,     text: "Knowledge Skills" },
      { value: $languagePoints,      text: "Language Skills"  },
   ]);

   let pendingLockModal = $state(false);

   function hasOpenSkillEditors(): boolean {
      return Object.values(ui.windows as unknown as Record<string, { id?: string }>).some(
         (app) => app.id?.startsWith(`sr3e-active-skill-editor-${actor.id}-`)
      );
   }

   async function showLockModal(): Promise<void> {
      const confirmed = await Dialog.confirm({
         title: "Complete Attribute Assignment?",
         content:
            "<p>You have spent all your attribute points.</p><p>Lock attributes and proceed to skill assignment?</p>",
      });

      if (confirmed) {
         const finalInt = $intelligenceStore;
         $knowledgePoints = finalInt * 5;
         $languagePoints = Math.floor(finalInt * 1.5);
         await attributeLocked.update(() => true);
      }
   }
   $effect(() => {
      const attrPoints = $creationPointsStore;
      if (attrPoints !== 0 || $attributeLocked) return;

      if (hasOpenSkillEditors()) {
         pendingLockModal = true;
         return;
      }

      pendingLockModal = false;
      (async () => { await showLockModal(); })();
   });
   $effect(() => {
      const hookId = Hooks.on("closeApplication", () => {
         if (pendingLockModal && !hasOpenSkillEditors()) {
            pendingLockModal = false;
            (async () => { await showLockModal(); })();
         }
      });
      return () => { Hooks.off("closeApplication", hookId); };
   });
</script>

<CreationPointList points={pointList} containerCSS="attribute-point-assignment" />
