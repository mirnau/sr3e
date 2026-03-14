<script lang="ts">
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { FLAGS } from "../../../constants/flags";
import { AttributeSpendingService } from "../../../services/character-creation/AttributeSpendingService";
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";
import type SR3EActor from "../../../documents/SR3EActor";

interface Props {
   actor: SR3EActor;
   attributeKey: string;
   label: string;
}

let { actor, attributeKey, label }: Props = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
const attributeValueStore = storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
const isCharacterCreation = storeManager.GetFlagStore(actor, FLAGS.ACTOR.IS_CHARACTER_CREATION, false);
const attributeLocked = storeManager.GetFlagStore(actor, FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED, false);
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false);
const creationPointsStore = storeManager.GetRWStore<number>(actor, "creation.attributePoints");
const spendingService = AttributeSpendingService.Instance();
const isDerivedAttribute = $derived(
   attributeKey === "reaction" ||
   attributeKey === "essence" ||
   attributeKey === "magic" ||
   attributeKey === "initiative"
);
const isKarmaMode = $derived($isShoppingState && !$isCharacterCreation);
const showChevrons = $derived(
   !isDerivedAttribute && (
      ($isCharacterCreation && !$attributeLocked) || isKarmaMode
   )
);
function canIncrease(): boolean {
   if (!actor) return false;
   $attributeValueStore;
   if (isKarmaMode) {
      return KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey);
   }
   $creationPointsStore;
   return spendingService.canIncreaseAttribute(actor, attributeKey);
}

function canDecrease(): boolean {
   if (!actor) return false;
   $attributeValueStore;
   if (isKarmaMode) {
      return KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey);
   }
   return spendingService.canDecreaseAttribute(actor, attributeKey);
}
function increaseAttribute(): void {
   if (!actor) return;
   if (isKarmaMode) {
      if (!KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey)) return;
      KarmaSpendingService.Instance().stageAttrIncrement(actor, attributeKey);
      return;
   }
   spendingService.increaseAttribute(actor, attributeKey);
}

function decreaseAttribute(): void {
   if (!actor) return;
   if (isKarmaMode) {
      if (!KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey)) return;
      KarmaSpendingService.Instance().stageAttrDecrement(actor, attributeKey);
      return;
   }
   spendingService.decreaseAttribute(actor, attributeKey);
}
</script>

<div class="attribute-card">
   <div class="attribute-card-shadow"></div>
   <div class="attribute-card-outline">
      <div class="attribute-card-displayarea"></div>
      <h4 class="attribute-label">{label}</h4>
      <div class="attribute-value-row">
         {#if showChevrons}
            <button
               type="button"
               class="attr-chevron attr-chevron-down"
               disabled={!canDecrease()}
               onclick={() => decreaseAttribute()}
               title="Decrease {attributeKey}"
               aria-label="Decrease {attributeKey}"
            >
               <i class="fa-solid fa-circle-chevron-down"></i>
            </button>
         {/if}
         <span class="attribute-value">{$attributeValueStore}</span>
         {#if showChevrons}
            <button
               type="button"
               class="attr-chevron attr-chevron-up"
               disabled={!canIncrease()}
               onclick={() => increaseAttribute()}
               title="Increase {attributeKey}"
               aria-label="Increase {attributeKey}"
            >
               <i class="fa-solid fa-circle-chevron-up"></i>
            </button>
         {/if}
      </div>
   </div>
</div>
