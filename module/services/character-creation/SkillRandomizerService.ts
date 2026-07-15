/**
 * Pure allocation algorithm for randomizing skill points during character creation.
 * Takes plain data in, returns plain data out — no Actor, store, or Foundry API dependency.
 *
 * Cost rule (matches SkillSpendingService's runtime cost formula):
 *   cost = currentRating < linkedAttrRating ? 1 : 2
 *
 * Unlike attributes, skills have no baseline floor — a ticked skill can legitimately
 * end at rating 0 if the pool runs out before it's ever picked.
 */

export interface TickedSkill {
	id: string;
	linkedAttrRating: number;
}

export interface SkillSelection {
	skillItemId: string;
	category: "active" | "knowledge" | "language";
	rating: number;
}

const MAX_SKILL_RATING = 6;

function cost(currentRating: number, linkedAttrRating: number): number {
	return currentRating < linkedAttrRating ? 1 : 2;
}

/**
 * Total point cost to raise a skill from 0 to `rating`, summing each level's
 * 1-vs-2 cost step. Used to compute the real remaining pool after a roll.
 */
export function totalCostForRating(rating: number, linkedAttrRating: number): number {
	let total = 0;
	for (let level = 0; level < rating; level++) total += cost(level, linkedAttrRating);
	return total;
}

/**
 * Randomly distributes pool points across ticked skills, one point at a time, to a
 * randomly chosen skill that is both under the rating cap and affordable against the
 * remaining pool. Stops when the pool is exhausted or no eligible skill remains.
 *
 * @param randomSource - Injectable RNG in [0, 1); defaults to Math.random. Pass a seeded
 * generator in tests for deterministic assertions.
 */
export function randomizeSkills(
	pool: number,
	tickedSkills: TickedSkill[],
	randomSource: () => number = Math.random
): Record<string, number> {
	const ratings: Record<string, number> = {};
	for (const skill of tickedSkills) ratings[skill.id] = 0;

	let remainingPool = pool;

	while (remainingPool > 0) {
		const eligible = tickedSkills.filter((skill) => {
			const rating = ratings[skill.id]!;
			return rating < MAX_SKILL_RATING && cost(rating, skill.linkedAttrRating) <= remainingPool;
		});
		if (eligible.length === 0) break;

		const pick = eligible[Math.floor(randomSource() * eligible.length)]!;
		const pickCost = cost(ratings[pick.id]!, pick.linkedAttrRating);
		ratings[pick.id]!++;
		remainingPool -= pickCost;
	}

	return ratings;
}
