<script lang="ts">
   import { onDestroy, untrack } from "svelte";
   import { localize } from "../../../services/utilities";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import StatCard from "./StatCard.svelte";
   import Foldout from "./Foldout.svelte";

   let { actor: _actor }: { actor: Actor } = $props();
   const actor = untrack(() => _actor);
   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

   const localization = $derived(CONFIG.SR3E.MOVEMENT);
   let metatype = $state<Item | null>(null);

   storeManager.Subscribe(actor);

   const quicknessStore = storeManager.GetSimpleStatROStore(actor, "attributes.quickness");
   const walking = storeManager.GetSimpleStatROStore(actor, "movement.walking");
   const walkingValue = storeManager.GetRWStore<number>(
      actor,
      "movement.walking.value",
   );
   const running = storeManager.GetSimpleStatROStore(actor, "movement.running");
   const runningValue = storeManager.GetRWStore<number>(
      actor,
      "movement.running.value",
   );
   const isShoppingState = storeManager.GetFlagStore<boolean>(
      actor,
      "isShoppingState",
      false,
   );
   const attributePreview = storeManager.GetShallowStore<any>(
      actor,
      "shoppingAttributePreview",
      { active: false, values: {} },
   );

   onDestroy(() => {
      Hooks.off("createItem", createHookId);
      Hooks.off("updateItem", updateHookId);
      Hooks.off("deleteItem", deleteHookId);
      storeManager.Unsubscribe(actor);
   });

   function rebuildMetatype(): void {
      metatype = [...((actor as any).items ?? [])].find((item: Item) => item.type === "metatype") ?? null;
   }

   function onItemChange(item: any): void {
      if (item.parent?.id !== (actor as any).id && item.actor?.id !== (actor as any).id) return;
      rebuildMetatype();
   }

   rebuildMetatype();

   const createHookId = Hooks.on("createItem", onItemChange);
   const updateHookId = Hooks.on("updateItem", onItemChange);
   const deleteHookId = Hooks.on("deleteItem", onItemChange);

   $effect(() => {
      if (!metatype) return;

      const runningMod = metatype.system?.movement?.factor ?? 3;
      const quicknessSum = $quicknessStore ?? 0;
      const quicknessPreview = $isShoppingState
         ? ($attributePreview?.values?.quickness ?? quicknessSum)
         : quicknessSum;

      walkingValue.set(quicknessPreview);
      runningValue.set(Math.floor(quicknessPreview * runningMod));
   });
</script>

<Foldout label={localize(localization.movement)}>
   <div class="stat-card-grid">
      <StatCard label={localize(localization?.walking)}>
         <span class="attribute-value">{$walking ?? 0}</span>
      </StatCard>
      <StatCard label={localize(localization?.running)}>
         <span class="attribute-value">{$running ?? 0}</span>
      </StatCard>
   </div>
</Foldout>
