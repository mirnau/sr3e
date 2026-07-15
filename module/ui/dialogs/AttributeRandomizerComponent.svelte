<script lang="ts">
import { PRIORITY_TABLES } from "../../../types/character-creation";
import {
   BUYABLE_ATTRIBUTES,
   randomizeAttributes,
   type AttributeValues,
   type RacialLimits,
} from "../../services/character-creation/AttributeRandomizerService";
import { localize } from "../../services/utilities";
import StatCard from "../actors/actor-components/StatCard.svelte";

interface Props {
   metatypeId: string;
   attributePriority: string;
   generatedAttributes: AttributeValues | null;
   onRandomize?: () => void;
   onClear?: () => void;
}

let {
   metatypeId,
   attributePriority,
   generatedAttributes = $bindable(null),
   onRandomize,
   onClear,
}: Props = $props();

const localization = $derived(CONFIG.SR3E.ATTRIBUTES);

const metatypeItem = $derived(
   metatypeId ? (game.items?.get(metatypeId) as Item | undefined) : undefined,
);

const racialLimits = $derived(
   (metatypeItem?.system as { attributeLimits?: RacialLimits })?.attributeLimits,
);

const totalPoints = $derived(
   PRIORITY_TABLES.attributes.find((entry) => entry.priority === attributePriority)?.points,
);

// The priority's point total already counts the baseline 1 spent on each attribute
// (mirrors CharacterInitializer's `attributePoints - 6`) — only the remainder is free to distribute.
const pointsToDistribute = $derived(
   totalPoints !== undefined ? totalPoints - BUYABLE_ATTRIBUTES.length : undefined,
);

const canRandomize = $derived(!!racialLimits && pointsToDistribute !== undefined);

function handleRandomize(): void {
   if (!racialLimits || pointsToDistribute === undefined) return;
   generatedAttributes = randomizeAttributes(pointsToDistribute, racialLimits);
   // A re-roll invalidates any skill points already spent against the old attribute
   // values (their cost depends on the linked attribute's rating) — cascade the clear.
   onRandomize?.();
}

function handleClear(): void {
   generatedAttributes = null;
   onClear?.();
}
</script>

<div class="attribute-randomizer">
   <div class="character-creation-buttonpanel">
      <button type="button" disabled={!canRandomize} onclick={handleRandomize}>
         <i class="fas fa-dice"></i>
         Randomize
      </button>

      <button type="button" disabled={!generatedAttributes} onclick={handleClear}>
         <i class="fas fa-eraser"></i>
         Clear
      </button>
   </div>

   {#if generatedAttributes}
      <div class="attribute-grid">
         {#each BUYABLE_ATTRIBUTES as key}
            <StatCard label={localize(localization[key as keyof typeof localization])}>
               <span class="attribute-value">{generatedAttributes[key]}</span>
            </StatCard>
         {/each}
      </div>
   {/if}
</div>
