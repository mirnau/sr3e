/**
 * Repository for querying and transforming metatype items from Foundry's game.items collection.
 * Provides data access for character creation metatype selection.
 */

// Type definitions for metatype data structures

export interface MetatypeOption {
	name: string;
	foundryitemid: string;
	priority: string;
}

export interface AgeRange {
	min: number;
	average: number;
	max: number;
}

export interface PhysicalRange {
	min: number;
	average: number;
	max: number;
}

export interface PhysicalData {
	height: PhysicalRange;
	weight: PhysicalRange;
}

export interface AttributeLimits {
	strength: number;
	quickness: number;
	body: number;
	charisma: number;
	intelligence: number;
	willpower: number;
}

export interface KarmaData {
	factor: number;
}

export interface MovementData {
	factor: number;
}

export interface MetatypeItemData {
	name: string;
	type: "metatype";
	img: string;
	system: {
		agerange: AgeRange;
		physical: PhysicalData;
		attributeLimits: AttributeLimits;
		karma: KarmaData;
		movement: MovementData;
		priority: string;
		journalId: string;
	};
}

export interface MetatypeItem {
	name: string;
	id: string;
	type: string;
	system: {
		priority: string;
		agerange: AgeRange;
		physical: PhysicalData;
		attributeLimits: AttributeLimits;
		karma: KarmaData;
		movement: MovementData;
		journalId: string;
	};
}

/**
 * Repository service for metatype data access.
 * Follows the singleton pattern established by NewsService.
 */
export class MetatypeRepository {
	static #instance: MetatypeRepository | null = null;

	static Instance(): MetatypeRepository {
		if (!this.#instance) this.#instance = new MetatypeRepository();
		return this.#instance;
	}

	/**
	 * Queries game.items for all metatype items and maps them to MetatypeOption structure.
	 * @returns Array of metatype options with name, foundryitemid, and priority
	 */
	getAllMetatypes(): MetatypeOption[] {
		const metatypes = game.items?.filter((item: Item) => item.type === "metatype") ?? [];

		return metatypes
			.filter(
				(m: Item): m is MetatypeItem =>
					!!m &&
					typeof m.name === "string" &&
					typeof m.id === "string" &&
					typeof (m.system as Record<string, unknown>)?.priority === "string"
			)
			.map((metatype: MetatypeItem) => ({
				name: metatype.name,
				foundryitemid: metatype.id,
				priority: metatype.system.priority,
			}));
	}

	/**
	 * Returns the default human metatype data structure.
	 * Used as fallback when no metatype items exist in game.items.
	 * @returns Complete metatype item data for human
	 */
	getDefaultHuman(): MetatypeItemData {
		return {
			name: "Human",
			type: "metatype",
			img: "systems/sr3e/textures/ai/humans.webp",
			system: {
				agerange: { min: 0, average: 30, max: 100 },
				physical: {
					height: { min: 150, average: 170, max: 220 },
					weight: { min: 50, average: 70, max: 250 },
				},
				attributeLimits: {
					strength: 6,
					quickness: 6,
					body: 6,
					charisma: 6,
					intelligence: 6,
					willpower: 6,
				},
				karma: {
					factor: 0.1,
				},
				movement: {
					factor: 3,
				},
				priority: "E",
				journalId: "",
			},
		};
	}
}
