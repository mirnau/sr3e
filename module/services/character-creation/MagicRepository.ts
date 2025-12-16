/**
 * Repository for querying and transforming magic items from Foundry's game.items collection.
 * Provides data access for character creation magic selection.
 */

// Type definitions for magic data structures

export interface MagicOption {
	priority: string;
	name: string;
	foundryitemid: string;
}

export interface AwakenedData {
	archetype: string;
	priority: string;
}

export interface MagicianTypeData {
	magicianType: string;
	tradition: string;
	drainResistanceAttribute: string;
	aspect: string;
	canAstrallyProject: boolean;
	totem: string;
	spellPoints: number;
}

export interface AdeptTypeData {
	powerPoints: number;
}

export interface MagicItemData {
	name: string;
	type: "magic";
	system: {
		awakened: AwakenedData;
		magicianData: MagicianTypeData;
		adeptData: AdeptTypeData;
	};
}

export interface MagicItem {
	name: string;
	id: string;
	type: string;
	system: {
		awakened: AwakenedData;
		magicianData: MagicianTypeData;
		adeptData: AdeptTypeData;
	};
}

/**
 * Repository service for magic item data access.
 * Follows the singleton pattern established by NewsService.
 */
export class MagicRepository {
	static #instance: MagicRepository | null = null;

	static Instance(): MagicRepository {
		if (!this.#instance) this.#instance = new MagicRepository();
		return this.#instance;
	}

	/**
	 * Returns all magic options including hardcoded "Unawakened" entries for priorities C, D, E
	 * plus all magic items from game.items.
	 * @returns Array of magic options with priority, name, and foundryitemid
	 */
	getAllMagics(): MagicOption[] {
		const unawakenedOptions: MagicOption[] = [
			{ priority: "E", name: "Unawakened", foundryitemid: "E-foundryItemId" },
			{ priority: "D", name: "Unawakened", foundryitemid: "D-foundryItemId" },
			{ priority: "C", name: "Unawakened", foundryitemid: "C-foundryItemId" },
		];

		const magicItems = game.items?.filter((item: Item) => item.type === "magic") ?? [];

		const magicOptions = magicItems
			.filter((m: Item) => {
				const system = m.system as Record<string, unknown>;
				const awakened = system?.awakened as Record<string, unknown> | undefined;
				return (
					!!m &&
					typeof m.name === "string" &&
					typeof m.id === "string" &&
					awakened !== undefined &&
					typeof awakened.priority === "string"
				);
			})
			.map((magic: Item) => {
				const system = magic.system as Record<string, unknown>;
				const awakened = system.awakened as { priority: string };
				return {
					priority: awakened.priority,
					name: magic.name,
					foundryitemid: magic.id,
				};
			});

		return [...unawakenedOptions, ...magicOptions];
	}

	/**
	 * Returns the default magic item data (Full Shaman, priority A).
	 * Used as fallback when no magic items exist in game.items.
	 * @returns Complete magic item data
	 */
	getDefaultMagic(): MagicItemData {
		return {
			name: "Full Shaman",
			type: "magic",
			system: {
				awakened: {
					archetype: "magician",
					priority: "A",
				},
				magicianData: {
					magicianType: "Full",
					tradition: "Bear",
					drainResistanceAttribute: "Charisma",
					aspect: "",
					canAstrallyProject: true,
					totem: "Bear",
					spellPoints: 25,
				},
				adeptData: {
					powerPoints: 0,
				},
			},
		};
	}
}
