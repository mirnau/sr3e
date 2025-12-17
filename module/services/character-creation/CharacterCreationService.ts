/**
 * Character creation service coordinator singleton.
 * Orchestrates repositories, validators, and initializers for character creation workflow.
 * Follows the singleton pattern established by NewsService.
 */

import { MetatypeRepository, type MetatypeOption } from "./MetatypeRepository";
import { MagicRepository, type MagicOption } from "./MagicRepository";
import { PriorityValidator, type SelectedPriorities, type ValidationResult } from "./PriorityValidator";
import { CharacterInitializer, type CharacterCreationSelections } from "./CharacterInitializer";
import type SR3EActor from "../../documents/SR3EActor";

/**
 * Priority combination for character creation randomization
 */
export interface PriorityCombination {
	metatype: string;
	magic: string;
	attribute: string;
	skills: string;
	resources: string;
}

/**
 * Options for generating random priorities
 */
export interface RandomPriorityOptions {
	metatypeOptions: MetatypeOption[];
	magicOptions: MagicOption[];
}

/**
 * Coordinator service that composes all character creation services.
 * Provides unified API for character creation workflow.
 */
export class CharacterCreationService {
	static readonly VALID_PRIORITIES = ["A", "B", "C", "D", "E"] as const;

	#metatypeRepo: MetatypeRepository;
	#magicRepo: MagicRepository;
	#validator: PriorityValidator;
	#initializer: CharacterInitializer;

	static #instance: CharacterCreationService | null = null;

	private constructor() {
		this.#metatypeRepo = MetatypeRepository.Instance();
		this.#magicRepo = MagicRepository.Instance();
		this.#validator = PriorityValidator.Instance();
		this.#initializer = CharacterInitializer.Instance();
	}

	static Instance(): CharacterCreationService {
		if (!this.#instance) this.#instance = new CharacterCreationService();
		return this.#instance;
	}

	/**
	 * Get all available metatype options
	 */
	getMetatypes(): MetatypeOption[] {
		return this.#metatypeRepo.getAllMetatypes();
	}

	/**
	 * Get all available magic options
	 */
	getMagics(): MagicOption[] {
		return this.#magicRepo.getAllMagics();
	}

	/**
	 * Validate priority selections
	 */
	validatePriorities(selections: SelectedPriorities): ValidationResult {
		return this.#validator.validatePrioritySelection(selections);
	}

	/**
	 * Initialize character with selected priorities and traits
	 */
	async initializeCharacter(actor: SR3EActor, selections: CharacterCreationSelections): Promise<void> {
		await this.#initializer.initializeCharacter(actor, selections);
	}

	/**
	 * Generate random priority combination using weighted randomization.
	 * Follows SR3e character generation patterns:
	 * - Metatype weighted toward E (64), with C/D at 18 each
	 * - Magic weighted toward C/D/E (32 each), with A/B at 2 each
	 * - Remaining priorities (attribute, skills, resources) assigned randomly
	 *
	 * @param options - Metatype and magic options to consider for forced priorities
	 * @returns Random priority combination
	 */
	generateRandomPriorities(options: RandomPriorityOptions): PriorityCombination {
		const priorities = [...CharacterCreationService.VALID_PRIORITIES];

		const weights = {
			metatype: { E: 64, C: 18, D: 18 } as Record<string, number>,
			magic: { A: 2, B: 2, C: 32, D: 32, E: 32 } as Record<string, number>,
		};

		const combination: Partial<PriorityCombination> = {};

		// If there's only one metatype option, force its priority
		const isOnlyOneMetatype = options.metatypeOptions.length === 1;
		combination.metatype = isOnlyOneMetatype
			? this.#forcePriority(priorities, options.metatypeOptions[0]!.priority)
			: this.#draw(priorities, weights.metatype);

		// If there's only one magic option, force its priority
		const isOnlyOneMagic = options.magicOptions.length === 1;
		combination.magic = isOnlyOneMagic
			? this.#forcePriority(priorities, options.magicOptions[0]!.priority)
			: this.#draw(priorities, weights.magic);

		// Assign remaining priorities randomly
		combination.attribute = this.#draw(priorities);
		combination.skills = this.#draw(priorities);
		combination.resources = this.#draw(priorities);

		return combination as PriorityCombination;
	}

	/**
	 * Draw a priority from the remaining pool, optionally using weighted randomization.
	 * Mutates the priorities array by removing the selected priority.
	 *
	 * @param priorities - Array of remaining priorities
	 * @param weightMap - Optional weight map for weighted selection
	 * @returns Selected priority letter
	 */
	#draw(priorities: string[], weightMap: Record<string, number> | null = null): string {
		if (priorities.length === 0) {
			throw new Error("No valid priorities remaining");
		}

		let choice: string;

		if (weightMap) {
			// Build weighted pool by repeating priorities according to weights
			const pool = priorities.flatMap((p) => Array(weightMap[p] || 0).fill(p));
			if (pool.length === 0) {
				throw new Error("Weighted pool is empty");
			}
			choice = pool[Math.floor(Math.random() * pool.length)]!;
		} else {
			// Uniform random selection
			choice = priorities[Math.floor(Math.random() * priorities.length)]!;
		}

		// Remove selected priority from pool
		const index = priorities.indexOf(choice);
		priorities.splice(index, 1);

		return choice;
	}

	/**
	 * Force a specific priority to be selected.
	 * Mutates the priorities array by removing the forced priority.
	 *
	 * @param priorities - Array of remaining priorities
	 * @param forced - Priority letter to force
	 * @returns The forced priority letter
	 */
	#forcePriority(priorities: string[], forced: string): string {
		const index = priorities.indexOf(forced);
		if (index === -1) {
			throw new Error(`Forced priority "${forced}" not available`);
		}
		priorities.splice(index, 1);
		return forced;
	}
}
