/**
 * Service for handling attribute point spending during character creation.
 * Validates spending against racial limits and available points.
 */

import { CreationPointsService } from "./CreationPointsService";

/**
 * Attribute keys in the SR3e system
 */
type AttributeKey = "strength" | "quickness" | "body" | "charisma" | "intelligence" | "willpower";

/**
 * Attribute spending service for character creation.
 * Follows singleton pattern established in Phase 1.
 */
export class AttributeSpendingService {
	static #instance: AttributeSpendingService | null = null;

	static Instance(): AttributeSpendingService {
		if (!this.#instance) this.#instance = new AttributeSpendingService();
		return this.#instance;
	}

	/**
	 * Check if character can increase an attribute.
	 * Validates:
	 * - Has remaining attribute points
	 * - Attribute not at racial maximum
	 */
	canIncreaseAttribute(actor: Actor, attributeKey: string): boolean {
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
	 * - Attribute not at minimum (1 for all attributes during creation)
	 */
	canDecreaseAttribute(actor: Actor, attributeKey: string): boolean {
		const currentValue = this.#getAttributeValue(actor, attributeKey);
		return currentValue > 1; // Minimum attribute value is 1
	}

	/**
	 * Increase an attribute by 1, spending 1 creation point.
	 * Updates actor attribute value and decrements creation points.
	 */
	async increaseAttribute(actor: Actor, attributeKey: string): Promise<void> {
		const currentValue = this.#getAttributeValue(actor, attributeKey);
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingAttributePoints(actor);

		await actor.update({
			[`system.attributes.${attributeKey}.value`]: currentValue + 1,
			"system.creation.attributePoints": remainingPoints - 1,
		});
	}

	/**
	 * Decrease an attribute by 1, refunding 1 creation point.
	 * Updates actor attribute value and increments creation points.
	 */
	async decreaseAttribute(actor: Actor, attributeKey: string): Promise<void> {
		const currentValue = this.#getAttributeValue(actor, attributeKey);
		const pointsService = CreationPointsService.Instance();
		const remainingPoints = pointsService.getRemainingAttributePoints(actor);

		await actor.update({
			[`system.attributes.${attributeKey}.value`]: currentValue - 1,
			"system.creation.attributePoints": remainingPoints + 1,
		});
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
