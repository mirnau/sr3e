/**
 * Service for orchestrating character initialization with selected priorities.
 * Implements SR3e character creation rules for attribute points, skill points, and initial setup.
 */

import { configkeys, flags } from "../../../types/configuration-keys";
import type SR3EActor from "../../documents/SR3EActor";
import { CreationPointsService } from "./CreationPointsService";
import { FLAGS } from "../../constants/flags";
import { localize } from "../utilities";
import type { AttributeValues, BuyableAttributeKey } from "./AttributeRandomizerService";
import { totalCostForRating, type SkillSelection } from "./SkillRandomizerService";

// Type definitions for character creation

export interface CharacterCreationSelections {
	metatypeId: string;
	magicId: string;
	attributePriority: string;
	skillPriority: string;
	resourcePriority: string;
	age: number;
	height: number;
	weight: number;
	generatedAttributes?: AttributeValues;
	skillSelections?: SkillSelection[];
	burnUnusedPoints?: boolean;
}

/**
 * SR3e priority tables for attributes and skills
 */
const ATTRIBUTE_POINTS: Record<string, number> = {
	A: 30,
	B: 27,
	C: 24,
	D: 21,
	E: 18,
};

const SKILL_POINTS: Record<string, number> = {
	A: 50,
	B: 40,
	C: 34,
	D: 30,
	E: 27,
};

const RESOURCE_NUYEN: Record<string, number> = {
	A: 1000000,
	B: 400000,
	C: 90000,
	D: 20000,
	E: 5000,
};

/**
 * Character initializer service.
 * Follows the singleton pattern established by NewsService.
 */
export class CharacterInitializer {
	static #instance: CharacterInitializer | null = null;

	static Instance(): CharacterInitializer {
		if (!this.#instance) this.#instance = new CharacterInitializer();
		return this.#instance;
	}

	/**
	 * Performs all character initialization steps based on selected priorities.
	 * Updates actor with profile, creation points, attributes, and embedded items.
	 *
	 * @param actor - The SR3E actor to initialize
	 * @param selections - Character creation selections including priorities and physical traits
	 */
	async initializeCharacter(actor: SR3EActor, selections: CharacterCreationSelections): Promise<void> {
		// Step 1: Calculate attribute and skill points from priorities
		const attributePoints = ATTRIBUTE_POINTS[selections.attributePriority];
		const skillPoints = SKILL_POINTS[selections.skillPriority]!;
		const pointsService = CreationPointsService.Instance();

		// Step 2: Prepare actor update data
		const generated = selections.generatedAttributes;
		const skillSelections = selections.skillSelections ?? [];
		const activeSkillPool = pointsService.getDistributedSkillPoints(skillPoints, "active");
		const remainders = this.#computeSkillPoolRemainders(skillSelections, generated, activeSkillPool);

		// Creation points (attribute points minus 6 initial for base stats, skill points from priority table).
		// Knowledge/language pools are normally calculated from final Intelligence at attribute-lock time
		// (AttributePointsState's lock-modal confirm), not here. If the player used the Attribute
		// Randomizer, the pool is fully spent (0) and that lock already happened implicitly, so the
		// same knowledge/language derivation runs immediately instead of waiting on the modal.
		let finalAttributePoints = generated ? 0 : attributePoints! - 6;
		// Skill pools default to the full priority-derived amount, then get overridden with the real
		// remainder if the player rolled skills (NOT forced to 0 — specialization assignment stays a
		// manual step, so the unspent-points gate must reflect reality) unless burnUnusedPoints below.
		let finalActivePoints = remainders.active ?? activeSkillPool;
		let finalKnowledgePoints = generated ? (remainders.knowledge ?? generated.intelligence * 5) : undefined;
		let finalLanguagePoints = generated ? (remainders.language ?? Math.floor(generated.intelligence * 1.5)) : undefined;

		// Extended-randomization option: discard whatever's left in every pool, spent or not.
		if (selections.burnUnusedPoints) {
			finalAttributePoints = 0;
			finalActivePoints = 0;
			finalKnowledgePoints = 0;
			finalLanguagePoints = 0;
		}

		const updateData: Record<string, unknown> = {
			// Profile data
			"system.profile.age": selections.age,
			"system.profile.height": selections.height,
			"system.profile.weight": selections.weight,

			"system.creation.attributePoints": finalAttributePoints,
			"system.creation.activePoints": finalActivePoints,
			...(finalKnowledgePoints !== undefined ? { "system.creation.knowledgePoints": finalKnowledgePoints } : {}),
			...(finalLanguagePoints !== undefined ? { "system.creation.languagePoints": finalLanguagePoints } : {}),

			// Initialize attributes to the randomizer's roll if the player used it, otherwise the 1-each baseline.
			// Essence always starts at the racial maximum of 6, independent of attribute-point spending.
			"system.attributes.strength.value": generated?.strength ?? 1,
			"system.attributes.quickness.value": generated?.quickness ?? 1,
			"system.attributes.body.value": generated?.body ?? 1,
			"system.attributes.charisma.value": generated?.charisma ?? 1,
			"system.attributes.intelligence.value": generated?.intelligence ?? 1,
			"system.attributes.willpower.value": generated?.willpower ?? 1,
			"system.attributes.essence.value": 6,

			// Initialize karma pool
			"system.karma.karmaPool.value": 1,
		};

		// Step 3: Update the actor
		await actor.update(updateData);

		// Step 4: Create embedded metatype item
		const metatypeItem = game.items?.get(selections.metatypeId)!;
		await actor.createEmbeddedDocuments("Item", [metatypeItem.toObject()]);

		// Step 4b: Create embedded copies of every ticked skill at its rolled rating
		if (skillSelections.length > 0) {
			const skillItems = skillSelections
				.map((selection) => this.#buildTickedSkillData(selection))
				.filter((data): data is Record<string, unknown> => data !== null);
			if (skillItems.length > 0) await actor.createEmbeddedDocuments("Item", skillItems);
		}

		// Step 5: Create starting resources as a credit stick
		await actor.createEmbeddedDocuments("Item", [this.#startingCreditStick(selections.resourcePriority)]);

		// Step 6: Handle magic awakening for priority A or B
		const magicPriority = this.#getMagicPriorityFromId(selections.magicId);
		if (magicPriority === "A" || magicPriority === "B") {
			// Create embedded magic item (if not Unawakened)
			if (!selections.magicId.includes("foundryItemId")) {
				const magicItem = game.items?.get(selections.magicId)!;
				await actor.createEmbeddedDocuments("Item", [magicItem.toObject()]);
			}

			// Set awakened flag and magic attribute
			await actor.setFlag(configkeys.sr3e, flags.hasAwakened, true);
			await actor.update({ "system.attributes.magic.value": 6 });
		}

		// Step 7: Set character creation mode flags.
		// A randomized attribute roll — or burning unused points outright — counts as an implicit
		// lock-in — skip the "spend your attribute points" phase (and its lock-confirmation modal)
		// and go straight to skill assignment.
		await actor.setFlag(configkeys.sr3e, FLAGS.ACTOR.IS_CHARACTER_CREATION, true);
		await actor.setFlag(
			configkeys.sr3e,
			FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED,
			!!generated || !!selections.burnUnusedPoints
		);

		console.log("SR3E | Character initialized in creation mode");
	}

	/**
	 * Extracts magic priority from magic item ID.
	 * Handles both real item IDs and synthetic "Unawakened" IDs (e.g., "E-foundryItemId").
	 * @param magicId - The magic item ID
	 * @returns The priority letter (A-E)
	 */
	#getMagicPriorityFromId(magicId: string): string {
		// Handle Unawakened synthetic IDs
		if (magicId.includes("-foundryItemId")) {
			return magicId.split("-")[0] ?? "E";
		}

		// Look up priority from actual item
		const magicItem = game.items?.get(magicId);
		if (!magicItem) {
			return "E"; // Default to E if item not found
		}

		const priority = (magicItem.system as { awakened?: { priority?: string } })?.awakened?.priority;
		return priority ?? "E";
	}

	/**
	 * Computes the real remaining points in each skill pool after the rolled selections'
	 * cost is subtracted from the priority-derived total. Returns undefined for a category
	 * with no selections, so the caller can fall back to the un-rolled default.
	 */
	#computeSkillPoolRemainders(
		skillSelections: SkillSelection[],
		generated: AttributeValues | undefined,
		activeSkillPool: number
	): { active?: number; knowledge?: number; language?: number } {
		const remainders: { active?: number; knowledge?: number; language?: number } = {};
		if (skillSelections.length === 0) return remainders;

		const totals: Record<SkillSelection["category"], number> = {
			active: activeSkillPool,
			knowledge: generated ? generated.intelligence * 5 : 0,
			language: generated ? Math.floor(generated.intelligence * 1.5) : 0,
		};
		const spent: Record<SkillSelection["category"], number> = { active: 0, knowledge: 0, language: 0 };

		for (const selection of skillSelections) {
			const linkedAttrRating = this.#linkedAttrRatingFor(selection, generated);
			spent[selection.category] += totalCostForRating(selection.rating, linkedAttrRating);
		}

		const touchedCategories = new Set(skillSelections.map((s) => s.category));
		for (const category of touchedCategories) {
			remainders[category] = totals[category] - spent[category];
		}

		return remainders;
	}

	/**
	 * Linked-attribute rating for a ticked skill: for active skills, the final rolled value
	 * of the skill's own linked attribute; for knowledge/language, always Intelligence.
	 */
	#linkedAttrRatingFor(selection: SkillSelection, generated: AttributeValues | undefined): number {
		if (!generated) return 1;
		if (selection.category !== "active") return generated.intelligence;

		const skillItem = game.items?.get(selection.skillItemId);
		const linkedAttribute = (skillItem?.system as { activeSkill?: { linkedAttribute?: string } })?.activeSkill
			?.linkedAttribute as BuyableAttributeKey | undefined;
		return (linkedAttribute && generated[linkedAttribute]) ?? 1;
	}

	/**
	 * Builds embedded-item data for a ticked skill: a copy of its catalog template with
	 * the rolled rating written into the category-appropriate value field.
	 */
	#buildTickedSkillData(selection: SkillSelection): Record<string, unknown> | null {
		const template = game.items?.get(selection.skillItemId);
		if (!template) return null;

		const data = template.toObject() as Record<string, unknown>;
		const system = { ...(data.system as Record<string, unknown>) };
		const categoryField = { ...(system[`${selection.category}Skill`] as Record<string, unknown>) };
		categoryField.value = selection.rating;
		system[`${selection.category}Skill`] = categoryField;
		data.system = system;

		return data;
	}

	#startingCreditStick(resourcePriority: string): Record<string, unknown> {
		return {
			name: localize(CONFIG.SR3E.TRANSACTION.startingcreditstick),
			type: "transaction",
			system: {
				amount: RESOURCE_NUYEN[resourcePriority] ?? 0,
				recurrent: false,
				isCreditStick: true,
				type: "asset",
				creditorId: "",
				interestPerMonth: 0,
				journalId: "",
				paidThroughPeriod: "",
				lastMissedPeriod: "",
				lastInterestPeriod: "",
			},
		};
	}
}
