/**
 * Service for handling attribute point spending during character creation.
 * Validates spending against racial limits and available points.
 * Uses StoreManager for reactive updates without triggering sheet re-renders.
 */

import { get } from "svelte/store";
import type { IStoreManager } from "../../utilities/IStoreManager";
import { StoreManager } from "../../utilities/StoreManager.svelte";

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
	 *
	 * Reads from stores (not actor.system) to get the current reactive value,
	 * since document.update() is async and actor.system may be stale.
	 */
	canIncreaseAttribute(actor: Actor, attributeKey: string): boolean {
		if (this.#isDerivedAttribute(attributeKey)) return false;

		const pointsStore = this.#storeManager.GetRWStore<number>(actor, "creation.attributePoints");
		const remainingPoints = get(pointsStore) ?? 0;
		if (remainingPoints <= 0) return false;

		const attributeStore = this.#storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
		const currentValue = get(attributeStore) ?? 1;
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
		if (this.#isDerivedAttribute(attributeKey)) return false;

		const attributeStore = this.#storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
		const currentValue = get(attributeStore) ?? 1;
		return currentValue > 1;
	}

	/**
	 * Increase an attribute by 1, spending 1 creation point.
	 * Reads current values from stores (not actor.system) to avoid async staleness.
	 */
	increaseAttribute(actor: Actor, attributeKey: string): void {
		if (this.#isDerivedAttribute(attributeKey)) return;

		const attributeStore = this.#storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
		const pointsStore = this.#storeManager.GetRWStore<number>(actor, "creation.attributePoints");

		attributeStore.set((get(attributeStore) ?? 1) + 1);
		pointsStore.set((get(pointsStore) ?? 0) - 1);
	}

	/**
	 * Decrease an attribute by 1, refunding 1 creation point.
	 * Reads current values from stores (not actor.system) to avoid async staleness.
	 */
	decreaseAttribute(actor: Actor, attributeKey: string): void {
		if (this.#isDerivedAttribute(attributeKey)) return;

		const attributeStore = this.#storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`);
		const pointsStore = this.#storeManager.GetRWStore<number>(actor, "creation.attributePoints");

		attributeStore.set((get(attributeStore) ?? 1) - 1);
		pointsStore.set((get(pointsStore) ?? 0) + 1);
	}

	/**
	 * Get racial maximum for attribute from character's metatype item.
	 * Returns 6 as default if metatype not found.
	 */
	#getRacialMaximum(actor: Actor, attributeKey: string): number {
		// Find metatype item on actor
		const metatypeItem = actor.items.find((item: Item) => item.type === "metatype");

		if (!metatypeItem) return 6; // Default racial max

		const system = metatypeItem.system as {
			attributeLimits?: Record<string, number>;
		};

		return system.attributeLimits?.[attributeKey] ?? 6;
	}
}
