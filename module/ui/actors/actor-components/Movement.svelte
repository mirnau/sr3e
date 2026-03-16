<script lang="ts">
   import { onDestroy } from "svelte";
   import { localize } from "../../../services/utilities";
   import type { IStoreManager } from "../../../utilities/IStoreManager";
   import { StoreManager } from "../../../utilities/StoreManager.svelte";
   import StatCard from "./StatCard.svelte";

   let { actor }: { actor: Actor } = $props();
   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

   const localization = $derived(CONFIG.SR3E.MOVEMENT);
   const metatype = $derived(
      actor?.items.find((i: any) => i.type === "metatype"),
   );

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

   onDestroy(() => storeManager.Unsubscribe(actor));
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

<h1>{localize(localization.movement)}</h1>
<div class="stat-card-grid">
   <StatCard label={localize(localization?.walking)}>
      <span class="attribute-value">{$walking ?? 0}</span>
   </StatCard>
   <StatCard label={localize(localization?.running)}>
      <span class="attribute-value">{$running ?? 0}</span>
   </StatCard>
</div>
