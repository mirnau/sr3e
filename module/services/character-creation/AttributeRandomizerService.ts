/**
 * Pure allocation algorithm for randomizing attribute points during character creation.
 * Takes plain data in, returns plain data out — no Actor, store, or Foundry API dependency.
 */

export const BUYABLE_ATTRIBUTES = ["strength", "quickness", "body", "charisma", "intelligence", "willpower"] as const;

export type BuyableAttributeKey = (typeof BUYABLE_ATTRIBUTES)[number];

export type RacialLimits = Record<BuyableAttributeKey, number>;

export type AttributeValues = Record<BuyableAttributeKey, number>;

const ATTRIBUTE_BASELINE = 1;

/**
 * Randomly distributes totalPoints across the six buyable attributes, one point at a time,
 * to attributes that have not yet reached their racial maximum. Stops when the pool is
 * exhausted or every attribute is capped.
 *
 * @param randomSource - Injectable RNG in [0, 1); defaults to Math.random. Pass a seeded
 * generator in tests for deterministic assertions.
 */
export function randomizeAttributes(
	totalPoints: number,
	racialLimits: RacialLimits,
	randomSource: () => number = Math.random
): AttributeValues {
	const values: AttributeValues = BUYABLE_ATTRIBUTES.reduce((acc, key) => {
		acc[key] = ATTRIBUTE_BASELINE;
		return acc;
	}, {} as AttributeValues);

	let remainingPoints = totalPoints;

	while (remainingPoints > 0) {
		const eligible = BUYABLE_ATTRIBUTES.filter((key) => values[key] < racialLimits[key]);
		if (eligible.length === 0) break;

		const pick = eligible[Math.floor(randomSource() * eligible.length)]!;
		values[pick]++;
		remainingPoints--;
	}

	return values;
}
