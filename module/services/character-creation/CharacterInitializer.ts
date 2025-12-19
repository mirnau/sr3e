/**
 * Service for orchestrating character initialization with selected priorities.
 * Implements SR3e character creation rules for attribute points, skill points, and initial setup.
 */

import { configkeys, flags } from "../../../types/configuration-keys";
import type SR3EActor from "../../documents/SR3EActor";
import { CreationPointsService } from "./CreationPointsService";

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
		const updateData: Record<string, unknown> = {
			// Profile data
			"system.profile.age": selections.age,
			"system.profile.height": selections.height,
			"system.profile.weight": selections.weight,

			// Creation points (attribute points minus 6 initial, skill points distributed across categories)
			"system.creationPoints.attributePoints": attributePoints! - 6,
			"system.creationPoints.activePoints": pointsService.getDistributedSkillPoints(skillPoints, "active"),
			"system.creationPoints.knowledgePoints": pointsService.getDistributedSkillPoints(skillPoints, "knowledge"),
			"system.creationPoints.languagePoints": pointsService.getDistributedSkillPoints(skillPoints, "language"),

			// Initialize all attributes to 1, essence to 6
			"system.attributes.strength.value": 1,
			"system.attributes.quickness.value": 1,
			"system.attributes.body.value": 1,
			"system.attributes.charisma.value": 1,
			"system.attributes.intelligence.value": 1,
			"system.attributes.willpower.value": 1,
			"system.attributes.essence.value": 6,

			// Initialize karma pool
			"system.karmaPool": 1,
		};

		// Step 3: Update the actor
		await actor.update(updateData);

		// Step 4: Create embedded metatype item
		const metatypeItem = game.items?.get(selections.metatypeId)!;
		// @ts-expect-error - Foundry VTT createEmbeddedDocuments has complex typing that toObject() satisfies at runtime
		await actor.createEmbeddedDocuments("Item", [metatypeItem.toObject()]);

		// Step 5: Handle magic awakening for priority A or B
		const magicPriority = this.#getMagicPriorityFromId(selections.magicId);
		if (magicPriority === "A" || magicPriority === "B") {
			// Create embedded magic item (if not Unawakened)
			if (!selections.magicId.includes("foundryItemId")) {
				const magicItem = game.items?.get(selections.magicId)!;
				// @ts-expect-error - Foundry VTT createEmbeddedDocuments has complex typing that toObject() satisfies at runtime
				await actor.createEmbeddedDocuments("Item", [magicItem.toObject()]);
			}

			// Set awakened flag and magic attribute
			await actor.setFlag(configkeys.sr3e, flags.hasAwakened, true);
			await actor.update({ "system.attributes.magic.value": 6 });
		}
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
}