/**
 * Service for handling skill point spending during character creation.
 * Manages separate point pools for active, knowledge, and language skills.
 */

import { get } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";
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

		if (!skillItem) {
			// Skill doesn't exist on character yet - create it
			const worldSkill = game.items?.get(skillId);
			if (!worldSkill) return; // Skill not found in world items

			// @ts-expect-error - Foundry VTT createEmbeddedDocuments has complex typing that toObject() satisfies at runtime
			await actor.createEmbeddedDocuments("Item", [worldSkill.toObject()]);

			// Update the newly created skill to rating 1 via StoreManager
			const newSkill = actor.items.find((item) => item.name === worldSkill.name && item.type === "skill");
			if (newSkill) {
				StoreManager.Instance.GetRWStore<number>(newSkill, `${category}Skill.value`).set(1);
			}
		} else {
			// Skill exists - increase rating via StoreManager
			const currentValue = this.#getSkillValue(actor, skillId, category);
			StoreManager.Instance.GetRWStore<number>(skillItem, `${category}Skill.value`).set(currentValue + 1);
		}

		// Decrement appropriate point pool via StoreManager.
		const pointsField = category === "active" ? "activePoints" : category === "knowledge" ? "knowledgePoints" : "languagePoints";
		const pointsStore = StoreManager.Instance.GetRWStore<number>(actor, `creation.${pointsField}`);
		pointsStore.set((get(pointsStore) ?? 0) - 1);
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

		const newValue = currentValue - 1;

		// Refund point to appropriate pool via StoreManager.
		const pointsField = category === "active" ? "activePoints" : category === "knowledge" ? "knowledgePoints" : "languagePoints";
		const pointsStore = StoreManager.Instance.GetRWStore<number>(actor, `creation.${pointsField}`);

		if (newValue === 0) {
			// Delete first, then refund — avoids updateActor hook overwriting the pending store write
			await skillItem.delete();
			pointsStore.set((get(pointsStore) ?? 0) + 1);
		} else {
			// Decrease rating via StoreManager, then refund
			StoreManager.Instance.GetRWStore<number>(skillItem, `${category}Skill.value`).set(newValue);
			pointsStore.set((get(pointsStore) ?? 0) + 1);
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

}
