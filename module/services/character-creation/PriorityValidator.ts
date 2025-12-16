/**
 * Service for validating priority selections during character creation.
 * Implements SR3e priority system rules: each priority letter (A-E) can only be used once.
 */

// Type definitions for priority validation

export interface SelectedPriorities {
	metatype: string;
	magic: string;
	attribute: string;
	skill: string;
	resource: string;
}

export interface PartialSelections {
	metatype?: string;
	magic?: string;
	attribute?: string;
	skill?: string;
	resource?: string;
}

export interface ValidationResult {
	valid: boolean;
	conflicts?: string[];
}

/**
 * Validator service for priority selection logic.
 * Follows the singleton pattern established by NewsService.
 */
export class PriorityValidator {
	static #instance: PriorityValidator | null = null;

	static Instance(): PriorityValidator {
		if (!this.#instance) this.#instance = new PriorityValidator();
		return this.#instance;
	}

	/**
	 * Validates that no duplicate priorities are selected across all five categories.
	 * Each priority letter (A-E) must be used exactly once.
	 * @param selected - Object containing all five priority selections
	 * @returns ValidationResult indicating whether selection is valid and any conflicts found
	 */
	validatePrioritySelection(selected: SelectedPriorities): ValidationResult {
		const priorities = [
			selected.metatype,
			selected.magic,
			selected.attribute,
			selected.skill,
			selected.resource,
		];

		const conflicts: string[] = [];
		const seen = new Set<string>();

		for (const priority of priorities) {
			if (!priority) {
				return { valid: false, conflicts: ["All priorities must be selected"] };
			}

			if (seen.has(priority)) {
				conflicts.push(priority);
			}

			seen.add(priority);
		}

		if (conflicts.length > 0) {
			return {
				valid: false,
				conflicts: [`Duplicate priorities found: ${conflicts.join(", ")}`],
			};
		}

		return { valid: true };
	}

	/**
	 * Returns an array of priority letters that have already been used in partial selections.
	 * Used to filter available options during character creation UI.
	 * @param selections - Partial priority selections (some may be undefined)
	 * @returns Array of priority letters that are already in use
	 */
	getUsedPriorities(selections: PartialSelections): string[] {
		const used: string[] = [];

		if (selections.metatype) used.push(selections.metatype);
		if (selections.magic) used.push(selections.magic);
		if (selections.attribute) used.push(selections.attribute);
		if (selections.skill) used.push(selections.skill);
		if (selections.resource) used.push(selections.resource);

		return used;
	}
}
