<script lang="ts">
import { untrack } from "svelte";
import { SkillRepository, type SkillOption } from "../../services/character-creation/SkillRepository";
import { getMagicSkillAccess } from "../../services/character-creation/MagicSkillAccess";
import { randomizeSkills, type SkillSelection } from "../../services/character-creation/SkillRandomizerService";
import { CreationPointsService } from "../../services/character-creation/CreationPointsService";
import type { AttributeValues, BuyableAttributeKey } from "../../services/character-creation/AttributeRandomizerService";
import type { SkillCategory } from "../../services/character-creation/SkillSpendingService";
import { localize } from "../../services/utilities";
import SkillRandomValueDisplay from "./SkillRandomValueDisplay.svelte";

interface Props {
   category: SkillCategory;
   label: string;
   magicId: string;
   skillPriority: string;
   generatedAttributes: AttributeValues | null;
   skillSelections: SkillSelection[];
}

let {
   category,
   label,
   magicId,
   skillPriority,
   generatedAttributes,
   skillSelections = $bindable([]),
}: Props = $props();

const skillRepo = SkillRepository.Instance();
const pointsService = CreationPointsService.Instance();

const catalog: SkillOption[] = $derived(skillRepo.getSkillsByCategory(category));

let ticked = $state<Record<string, boolean>>({});
let ratings = $state<Record<string, number>>({});

const magicItem = $derived(magicId ? (game.items?.get(magicId) as Item | undefined) : undefined);
const magicAccess = $derived(
   getMagicSkillAccess(magicItem?.system as { archetype?: string; magicianType?: string; aspect?: string } | undefined),
);

$effect(() => {
   if (category !== "active") return;
   const access = magicAccess;
   const sorceryName = localize(CONFIG.SR3E.SKILL.sorcery);
   const conjuringName = localize(CONFIG.SR3E.SKILL.conjuring);
   const sorcery = catalog.find((s) => s.name === sorceryName);
   const conjuring = catalog.find((s) => s.name === conjuringName);

   // untrack the read of `ticked` — this effect must only re-run when magicAccess/catalog
   // change, not whenever it writes ticked itself (that would be a self-triggering loop).
   const next = { ...untrack(() => ticked) };
   if (sorcery) next[sorcery.foundryitemid] = access.sorcery;
   if (conjuring) next[conjuring.foundryitemid] = access.conjuring;
   ticked = next;
});

const canRandomize = $derived(!!generatedAttributes);

function pool(): number {
   if (!generatedAttributes) return 0;
   if (category === "active") {
      const totalSkillPoints = pointsService.getTotalSkillPoints(skillPriority);
      return pointsService.getDistributedSkillPoints(totalSkillPoints, "active");
   }
   if (category === "knowledge") return generatedAttributes.intelligence * 5;
   return Math.floor(generatedAttributes.intelligence * 1.5);
}

function linkedAttrRatingFor(skill: SkillOption): number {
   if (!generatedAttributes) return 0;
   if (category !== "active") return generatedAttributes.intelligence;
   return generatedAttributes[skill.linkedAttribute as BuyableAttributeKey] ?? 1;
}

function toggleSkill(skillId: string): void {
   const isTicked = !!ticked[skillId];
   ticked = { ...ticked, [skillId]: !isTicked };

   const nextRatings = { ...ratings };
   if (isTicked) delete nextRatings[skillId];
   else nextRatings[skillId] = 0;
   ratings = nextRatings;
}

function randomize(): void {
   if (!generatedAttributes) return;

   const tickedSkills = catalog
      .filter((skill) => ticked[skill.foundryitemid])
      .map((skill) => ({ id: skill.foundryitemid, linkedAttrRating: linkedAttrRatingFor(skill) }));

   ratings = randomizeSkills(pool(), tickedSkills);
}

function clear(): void {
   ticked = {};
   ratings = {};
}

$effect(() => {
   skillSelections = Object.entries(ratings).map(([skillItemId, rating]) => ({
      skillItemId,
      category,
      rating,
   }));
});
</script>

<div class="skills-checklist-category">
   <div class="title-container">
      <h4 class="no-margin uppercase">{label} Skills</h4>
   </div>

   <div class="skills-checklist-list">
      {#each catalog as skill (skill.foundryitemid)}
         <SkillRandomValueDisplay
            label={skill.name}
            checked={!!ticked[skill.foundryitemid]}
            value={ratings[skill.foundryitemid]}
            onChange={() => toggleSkill(skill.foundryitemid)}
         />
      {/each}
   </div>

   <div class="character-creation-buttonpanel">
      <button type="button" class:highlighted={canRandomize} disabled={!canRandomize} onclick={randomize}>
         <i class="fas fa-dice"></i>
         Randomize
      </button>
      <button type="button" onclick={clear}>
         <i class="fas fa-eraser"></i>
         Clear
      </button>
   </div>
</div>
