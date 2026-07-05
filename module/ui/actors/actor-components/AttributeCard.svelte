<script lang="ts">
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { FLAGS } from "../../../constants/flags";
import { AttributeSpendingService } from "../../../services/character-creation/AttributeSpendingService";
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";
import type SR3EActor from "../../../documents/SR3EActor";
import { buildAttributeSetup } from "../../../services/combat/procedures/simpleSetups";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";
import { claimPendingResponse } from "../../../services/combat/engine/responseInterceptor";
import { submitContestResponse } from "../../../services/combat/engine/contestCoordinator";
import type { RollSnapshot } from "../../../services/combat/engine/types";
import type { ProcedureSetup } from "../../../services/combat/procedures/simpleSetups";
import FieldLabel from "../../common-components/FieldLabel.svelte";

interface Props {
   actor: SR3EActor;
   attributeKey: string;
   label: string;
}

import { untrack } from "svelte";
let { actor: _actor, attributeKey: _attributeKey, label }: Props = $props();
const actor = untrack(() => _actor);
const attributeKey = untrack(() => _attributeKey);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
const attributeValueStore = storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
const attributeTotalStore = storeManager.GetSimpleStatROStore(actor, `attributes.${attributeKey}`);
const isCharacterCreation = storeManager.GetFlagStore(actor, FLAGS.ACTOR.IS_CHARACTER_CREATION, false);
const attributeLocked = storeManager.GetFlagStore(actor, FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED, false);
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false);
const creationPointsStore = storeManager.GetRWStore<number>(actor, "creation.attributePoints");
const attrKarmaSession = storeManager.GetShallowStore<{ active: boolean; attrSnapshot: Record<string, number>; stagedDeltas: Record<string, number> }>(
    actor, "shoppingKarmaSession", { active: false, attrSnapshot: {}, stagedDeltas: {} }
);
const spendingService = AttributeSpendingService.Instance();
const isDerivedAttribute = $derived(
   attributeKey === "reaction" ||
   attributeKey === "essence" ||
   attributeKey === "magic" ||
   attributeKey === "initiative"
);
const canRoll = attributeKey !== "essence" && attributeKey !== "initiative";
const isKarmaMode = $derived($isShoppingState && !$isCharacterCreation);
const rawDisplayValue = $derived(
    isKarmaMode && $attrKarmaSession?.active
        ? ($attrKarmaSession.attrSnapshot[attributeKey] ?? $attributeValueStore) + ($attrKarmaSession.stagedDeltas?.[attributeKey] ?? 0)
        : $attributeTotalStore
);
// Essence is the one attribute expressed to a decimal place (see EssenceStat)
// — summing its .value and .mod as floats can land on e.g. 5.699999999999999.
const displayValue = $derived(
    attributeKey === "essence" ? rawDisplayValue.toFixed(1) : rawDisplayValue
);
const showChevrons = $derived(
   !isDerivedAttribute && (
      ($isCharacterCreation && !$attributeLocked) || isKarmaMode
   )
);
function canIncrease(): boolean {
   if (!actor) return false;
   $attrKarmaSession; // reactive dep — session changes drive re-eval in karma mode
   $attributeValueStore;
   if (isKarmaMode) {
      return KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey);
   }
   $creationPointsStore;
   return spendingService.canIncreaseAttribute(actor, attributeKey);
}

function canDecrease(): boolean {
   if (!actor) return false;
   $attrKarmaSession; // reactive dep
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

function onRollClick(e: MouseEvent): void {
    if ($isCharacterCreation || $isShoppingState || !canRoll) return;
    const setup = buildAttributeSetup(actor, attributeKey, label);
    const actorId = (actor as unknown as { id?: string }).id ?? "";
    const pendingContest = claimPendingResponse(actorId);
    if (pendingContest) {
        const responseSetup: ProcedureSetup = { ...setup, selfPublish: false, defenseHint: null, commitFn: async (roll: unknown) => { submitContestResponse(pendingContest, roll as RollSnapshot); } };
        openComposer(responseSetup, actor);
        return;
    }
    const hasTargets = (game.user?.targets?.size ?? 0) > 0;
    if (e.shiftKey || hasTargets) {
        openComposer(setup, actor);
    } else {
        void executeProcedure(setup, actor as never);
    }
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
   <div
      class="attribute-card-outline{canRoll && !$isCharacterCreation && !$isShoppingState ? ' rollable' : ''}"
      role={canRoll && !$isCharacterCreation && !$isShoppingState ? 'button' : undefined}
      tabindex={canRoll && !$isCharacterCreation && !$isShoppingState ? 0 : undefined}
      onclick={(e) => onRollClick(e)}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onRollClick(new MouseEvent('click'))}
   >
      <div class="attribute-card-displayarea"></div>
      <FieldLabel {label} className="attribute-label" />
      <div class="attribute-value-row">
         {#if showChevrons}
            <button
               type="button"
               class="attr-chevron attr-chevron-down"
               disabled={!canDecrease()}
               onclick={(e) => { e.stopPropagation(); decreaseAttribute(); }}
               title="Decrease {attributeKey}"
               aria-label="Decrease {attributeKey}"
            >
               <i class="fa-solid fa-circle-chevron-down"></i>
            </button>
         {/if}
         <span class="attribute-value">{displayValue}</span>
         {#if showChevrons}
            <button
               type="button"
               class="attr-chevron attr-chevron-up"
               disabled={!canIncrease()}
               onclick={(e) => { e.stopPropagation(); increaseAttribute(); }}
               title="Increase {attributeKey}"
               aria-label="Increase {attributeKey}"
            >
               <i class="fa-solid fa-circle-chevron-up"></i>
            </button>
         {/if}
      </div>
   </div>
</div>
