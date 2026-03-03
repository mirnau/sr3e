/**
 * Service for calculating and tracking creation point expenditure during character creation.
 * Handles attribute points and skill points (active/knowledge/language categories).
 *
 * Knowledge and language pools are intelligence-derived (Int×5 and floor(Int×1.5))
 * and dynamically reflect the current store value of intelligence.
 */

import { get } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";
import { FLAGS } from "../../constants/flags";

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
 * Distribution of skill points across categories.
 * Based on SR3e rules: active skills get most points, knowledge/language get smaller pools.
 */
const SKILL_DISTRIBUTION = {
	active: 0.6, // 60% of total skill points
	knowledge: 0.25, // 25% of total skill points
	language: 0.15, // 15% of total skill points
};

/**
 * Creation points service for character creation point tracking.
 * Follows singleton pattern established in Phase 1.
 */
export class CreationPointsService {
	static #instance: CreationPointsService | null = null;

	static Instance(): CreationPointsService {
		if (!this.#instance) this.#instance = new CreationPointsService();
		return this.#instance;
	}

	/**
	 * Calculate remaining attribute points for character in creation mode.
	 * Reads stored creation points from actor system data.
	 */
	getRemainingAttributePoints(actor: Actor): number {
		const stored = (actor.system as { creation?: { attributePoints?: number } }).creation?.attributePoints;
		return stored ?? 0;
	}

	/**
	 * Calculate remaining skill points by category.
	 *
	 * Active: priority-based pool stored in creation.activePoints (remaining).
	 * Knowledge: Int × 5 minus creation.knowledgeSpent. Reads intelligence from
	 *   the reactive store to reflect mid-creation attribute changes immediately.
	 * Language: floor(Int × 1.5) minus creation.languageSpent. Same approach.
	 */
	getRemainingSkillPoints(actor: Actor, category: "active" | "knowledge" | "language"): number {
		const system = actor.system as {
			creation?: {
				activePoints?: number;
				knowledgeSpent?: number;
				languageSpent?: number;
			};
		};

		switch (category) {
			case "active":
				return system.creation?.activePoints ?? 0;
			case "knowledge": {
				const intelStore = StoreManager.Instance.GetRWStore<number>(
					actor as unknown as import("../../utilities/IStoreManager").FoundryDocument,
					"attributes.intelligence.value"
				);
				const intel = get(intelStore) ?? 1;
				const spent = system.creation?.knowledgeSpent ?? 0;
				return (intel * 5) - spent;
			}
			case "language": {
				const intelStore = StoreManager.Instance.GetRWStore<number>(
					actor as unknown as import("../../utilities/IStoreManager").FoundryDocument,
					"attributes.intelligence.value"
				);
				const intel = get(intelStore) ?? 1;
				const spent = system.creation?.languageSpent ?? 0;
				return Math.floor(intel * 1.5) - spent;
			}
		}
	}

	/**
	 * Get total attribute points based on priority level.
	 * Used during character initialization.
	 */
	getTotalAttributePoints(priorityLevel: string): number {
		return ATTRIBUTE_POINTS[priorityLevel] ?? 18;
	}

	/**
	 * Get total skill points based on priority level.
	 * Used during character initialization.
	 */
	getTotalSkillPoints(priorityLevel: string): number {
		return SKILL_POINTS[priorityLevel] ?? 27;
	}

	/**
	 * Calculate distributed skill points for a category based on total skill points.
	 * Uses SKILL_DISTRIBUTION ratios.
	 */
	getDistributedSkillPoints(totalSkillPoints: number, category: "active" | "knowledge" | "language"): number {
		return Math.floor(totalSkillPoints * SKILL_DISTRIBUTION[category]);
	}

	/**
	 * Check if character has any unspent creation points.
	 * Used for early termination warning dialog.
	 */
	hasUnspentPoints(actor: Actor): boolean {
		const attrPoints = this.getRemainingAttributePoints(actor);
		const activePoints = this.getRemainingSkillPoints(actor, "active");
		const knowledgePoints = this.getRemainingSkillPoints(actor, "knowledge");
		const languagePoints = this.getRemainingSkillPoints(actor, "language");

		return attrPoints > 0 || activePoints > 0 || knowledgePoints > 0 || languagePoints > 0;
	}

	/**
	 * Check if actor is in character creation mode.
	 */
	isInCreationMode(actor: Actor): boolean {
		return (actor.getFlag("sr3e", FLAGS.ACTOR.IS_CHARACTER_CREATION) as boolean) ?? false;
	}

	/**
	 * Set character creation mode flag.
	 */
	async setCreationMode(actor: Actor, enabled: boolean): Promise<void> {
		await actor.setFlag("sr3e", FLAGS.ACTOR.IS_CHARACTER_CREATION, enabled);
	}

	/**
	 * Check if attribute assignment is locked (transitioned to skill spending phase).
	 */
	isAttributeAssignmentLocked(actor: Actor): boolean {
		return (actor.getFlag("sr3e", FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED) as boolean) ?? false;
	}

	/**
	 * Lock attribute assignment, transitioning to skill spending phase.
	 */
	async lockAttributeAssignment(actor: Actor): Promise<void> {
		await actor.setFlag("sr3e", FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED, true);
	}
}
