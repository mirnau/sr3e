/**
 * Repository for querying skill items from Foundry's game.items collection.
 * Provides data access for character creation skill selection.
 */

import type { SkillCategory } from "./SkillSpendingService";

export interface SkillOption {
	name: string;
	foundryitemid: string;
	category: SkillCategory;
	linkedAttribute: string;
}

const LINKED_ATTRIBUTE_PATH: Record<SkillCategory, string> = {
	active: "activeSkill",
	knowledge: "knowledgeSkill",
	language: "languageSkill",
};

/**
 * Repository service for skill item data access.
 * Follows the singleton pattern established by MetatypeRepository/MagicRepository.
 */
export class SkillRepository {
	static #instance: SkillRepository | null = null;

	static Instance(): SkillRepository {
		if (!this.#instance) this.#instance = new SkillRepository();
		return this.#instance;
	}

	/**
	 * Queries game.items for all skill items of the given category.
	 * @returns Array of skill options with name, id, category, and linked attribute
	 */
	getSkillsByCategory(category: SkillCategory): SkillOption[] {
		const skills = game.items?.filter((item: Item) => item.type === "skill") ?? [];

		return skills
			.filter((item: Item) => {
				const system = item.system as Record<string, unknown>;
				return system?.skillType === category;
			})
			.map((item: Item) => {
				const system = item.system as Record<string, Record<string, unknown>>;
				const linkedAttribute = (system[LINKED_ATTRIBUTE_PATH[category]]?.linkedAttribute as string) ?? "";
				return {
					name: item.name,
					foundryitemid: item.id!,
					category,
					linkedAttribute,
				};
			});
	}
}
