/**
 * Service for handling skill point spending during character creation.
 * Manages separate point pools for active, knowledge, and language skills.
 */

import { CreationPointsService } from "./CreationPointsService";

type SkillCategory = "active" | "knowledge" | "language";

/**
 * Maximum skill rating during character creation (SR3e rule: skills cap at 6)
 */
const MAX_SKILL_RATING = 6;

/**
 * Skill spending service for character creation.
 * Follows singleton pattern established in Phase 1.
 */
export class SkillSpendingService {
	static #instance: SkillSpendingService | null = null;

	static Instance(): SkillSpendingService {
		if (!this.#instance) this.#instance = new SkillSpendingService();
		return this.#instance;
	}

	/**
	 * Check if character can increase a skill.
	 * Validates:
	 * - Has remaining points in the skill's category pool
	 * - Skill not at maximum rating (6)
	 */
	canIncreaseSkill(actor: Actor, skillId: string, category: SkillCategory): boolean {
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingSkillPoints(actor, category);

		if (remainingPoints <= 0) return false;

		const currentValue = this.#getSkillValue(actor, skillId, category);
		return currentValue < MAX_SKILL_RATING;
	}

	/**
	 * Check if character can decrease a skill.
	 * Validates:
	 * - Skill rating > 0
	 */
	canDecreaseSkill(actor: Actor, skillId: string): boolean {
		// Find skill item to determine category
		const skillItem = actor.items.get(skillId);
		if (!skillItem || skillItem.type !== "skill") return false;

		const category = this.#getSkillCategory(skillItem);
		const currentValue = this.#getSkillValue(actor, skillId, category);

		return currentValue > 0;
	}

	/**
	 * Increase a skill by 1, spending 1 creation point from appropriate pool.
	 * Creates skill item if it doesn't exist, otherwise updates existing skill.
	 */
	async increaseSkill(actor: Actor, skillId: string, category: SkillCategory): Promise<void> {
		const skillItem = actor.items.get(skillId);
		const pointsService = CreationPointsService.Instance();

		if (!skillItem) {
			// Skill doesn't exist on character yet - create it
			const worldSkill = game.items?.get(skillId);
			if (!worldSkill) return; // Skill not found in world items

			// @ts-expect-error - Foundry VTT createEmbeddedDocuments has complex typing that toObject() satisfies at runtime
			await actor.createEmbeddedDocuments("Item", [worldSkill.toObject()]);

			// Update the newly created skill to rating 1
			const newSkill = actor.items.find((item) => item.name === worldSkill.name && item.type === "skill");
			if (newSkill) {
				await newSkill.update({ [`system.${category}Skill.value`]: 1 });
			}
		} else {
			// Skill exists - increase rating
			const currentValue = this.#getSkillValue(actor, skillId, category);
			await skillItem.update({ [`system.${category}Skill.value`]: currentValue + 1 });
		}

		// Decrement appropriate point pool
		const remainingPoints = pointsService.getRemainingSkillPoints(actor, category);
		const pointField = this.#getPointFieldName(category);
		await actor.update({ [`system.creation.${pointField}`]: remainingPoints - 1 });
	}

	/**
	 * Decrease a skill by 1, refunding 1 creation point to appropriate pool.
	 * If skill reaches 0, optionally remove the item.
	 */
	async decreaseSkill(actor: Actor, skillId: string): Promise<void> {
		const skillItem = actor.items.get(skillId);
		if (!skillItem || skillItem.type !== "skill") return;

		const category = this.#getSkillCategory(skillItem);
		const currentValue = this.#getSkillValue(actor, skillId, category);

		if (currentValue <= 0) return;

		// Decrease rating
		const newValue = currentValue - 1;
		await skillItem.update({ [`system.${category}Skill.value`]: newValue });

		// Refund point to appropriate pool
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingSkillPoints(actor, category);
		const pointField = this.#getPointFieldName(category);
		await actor.update({ [`system.creation.${pointField}`]: remainingPoints + 1 });

		// Optionally remove skill if rating is 0
		if (newValue === 0) {
			await skillItem.delete();
		}
	}

	/**
	 * Get current skill rating value.
	 */
	#getSkillValue(actor: Actor, skillId: string, category: SkillCategory): number {
		const skillItem = actor.items.get(skillId);
		if (!skillItem || skillItem.type !== "skill") return 0;

		const system = skillItem.system as Record<string, { value?: number }>;
		return system[`${category}Skill`]?.value ?? 0;
	}

	/**
	 * Get skill category from skill item.
	 */
	#getSkillCategory(skillItem: Item): SkillCategory {
		const system = skillItem.system as { skillType?: string };
		const skillType = system.skillType ?? "active";

		if (skillType === "knowledge") return "knowledge";
		if (skillType === "language") return "language";
		return "active";
	}

	/**
	 * Map skill category to point field name in actor.system.creationPoints.
	 */
	#getPointFieldName(category: SkillCategory): string {
		switch (category) {
			case "active":
				return "activePoints";
			case "knowledge":
				return "knowledgePoints";
			case "language":
				return "languagePoints";
		}
	}
}
