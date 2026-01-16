/**
 * Service for handling attribute point spending during character creation.
 * Validates spending against racial limits and available points.
 * Uses StoreManager for reactive updates without triggering sheet re-renders.
 */

import { CreationPointsService } from "./CreationPointsService";
import type { IStoreManager } from "../../utilities/IStoreManager";
import { StoreManager } from "../../utilities/StoreManager.svelte";

/**
 * Attribute keys in the SR3e system
 */
type AttributeKey = "strength" | "quickness" | "body" | "charisma" | "intelligence" | "willpower";

/**
 * Derived attributes that cannot be bought with points
 */
const DERIVED_ATTRIBUTES = ["reaction", "essence"] as const;

/**
 * Attribute spending service for character creation.
 * Follows singleton pattern established in Phase 1.
 */
export class AttributeSpendingService {
	static #instance: AttributeSpendingService | null = null;
	#storeManager: IStoreManager;

	private constructor() {
		this.#storeManager = StoreManager.Instance as IStoreManager;
	}

	static Instance(): AttributeSpendingService {
		if (!this.#instance) this.#instance = new AttributeSpendingService();
		return this.#instance;
	}

	/**
	 * Check if an attribute is derived (computed, not purchasable)
	 */
	#isDerivedAttribute(attributeKey: string): boolean {
		return DERIVED_ATTRIBUTES.includes(attributeKey as typeof DERIVED_ATTRIBUTES[number]);
	}

	/**
	 * Check if character can increase an attribute.
	 * Validates:
	 * - Attribute is not derived (reaction, essence)
	 * - Has remaining attribute points
	 * - Attribute not at racial maximum
	 */
	canIncreaseAttribute(actor: Actor, attributeKey: string): boolean {
		// Derived attributes cannot be purchased
		if (this.#isDerivedAttribute(attributeKey)) return false;

		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingAttributePoints(actor);

		if (remainingPoints <= 0) return false;

		const currentValue = this.#getAttributeValue(actor, attributeKey);
		const racialMax = this.#getRacialMaximum(actor, attributeKey);

		return currentValue < racialMax;
	}

	/**
	 * Check if character can decrease an attribute.
	 * Validates:
	 * - Attribute is not derived (reaction, essence)
	 * - Attribute not at minimum (1 for all attributes during creation)
	 */
	canDecreaseAttribute(actor: Actor, attributeKey: string): boolean {
		// Derived attributes cannot be purchased
		if (this.#isDerivedAttribute(attributeKey)) return false;

		const currentValue = this.#getAttributeValue(actor, attributeKey);
		return currentValue > 1; // Minimum attribute value is 1
	}

	/**
	 * Increase an attribute by 1, spending 1 creation point.
	 * Uses StoreManager for reactive updates without re-rendering sheet.
	 */
	increaseAttribute(actor: Actor, attributeKey: string): void {
		// Guard: derived attributes cannot be modified
		if (this.#isDerivedAttribute(attributeKey)) return;

		const currentValue = this.#getAttributeValue(actor, attributeKey);
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingAttributePoints(actor);

		// Get stores and update via set() - this uses render: false internally
		const attributeStore = this.#storeManager.GetRWStore<number>(
			actor,
			`attributes.${attributeKey}.value`
		);
		const pointsStore = this.#storeManager.GetRWStore<number>(
			actor,
			"creation.attributePoints"
		);

		attributeStore.set(currentValue + 1);
		pointsStore.set(remainingPoints - 1);
	}

	/**
	 * Decrease an attribute by 1, refunding 1 creation point.
	 * Uses StoreManager for reactive updates without re-rendering sheet.
	 */
	decreaseAttribute(actor: Actor, attributeKey: string): void {
		// Guard: derived attributes cannot be modified
		if (this.#isDerivedAttribute(attributeKey)) return;

		const currentValue = this.#getAttributeValue(actor, attributeKey);
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingAttributePoints(actor);

		// Get stores and update via set() - this uses render: false internally
		const attributeStore = this.#storeManager.GetRWStore<number>(
			actor,
			`attributes.${attributeKey}.value`
		);
		const pointsStore = this.#storeManager.GetRWStore<number>(
			actor,
			"creation.attributePoints"
		);

		attributeStore.set(currentValue - 1);
		pointsStore.set(remainingPoints + 1);
	}

	/**
	 * Get current attribute value from actor.
	 */
	#getAttributeValue(actor: Actor, attributeKey: string): number {
		const system = actor.system as {
			attributes?: Record<string, { value?: number }>;
		};
		return system.attributes?.[attributeKey]?.value ?? 1;
	}

	/**
	 * Get racial maximum for attribute from character's metatype item.
	 * Returns 6 as default if metatype not found.
	 */
	#getRacialMaximum(actor: Actor, attributeKey: string): number {
		// Find metatype item on actor
		const metatypeItem = actor.items.find((item) => item.type === "metatype");

		if (!metatypeItem) return 6; // Default racial max

		const system = metatypeItem.system as {
			attributeLimits?: Record<string, number>;
		};

		return system.attributeLimits?.[attributeKey] ?? 6;
	}
}
