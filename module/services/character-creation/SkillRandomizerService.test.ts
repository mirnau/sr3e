import { describe, expect, it } from "vitest";
import { randomizeSkills, totalCostForRating, type TickedSkill } from "./SkillRandomizerService";

function skills(count: number, linkedAttrRating: number): TickedSkill[] {
	return Array.from({ length: count }, (_, i) => ({ id: `skill-${i}`, linkedAttrRating }));
}

describe("randomizeSkills", () => {
	it("never exceeds the rating cap of 6", () => {
		const result = randomizeSkills(100, skills(3, 4));

		for (const rating of Object.values(result)) {
			expect(rating).toBeLessThanOrEqual(6);
		}
	});

	it("never spends more than the pool (1-point cost below linked attribute)", () => {
		// All skills start below their linked attribute rating (4), so every point costs 1
		// until a skill reaches rating 4, after which it costs 2.
		const pool = 10;
		const result = randomizeSkills(pool, skills(3, 4));

		let spent = 0;
		for (const rating of Object.values(result)) {
			for (let r = 0; r < rating; r++) {
				spent += r < 4 ? 1 : 2;
			}
		}
		expect(spent).toBeLessThanOrEqual(pool);
	});

	it("applies the 1-vs-2 cost step relative to each skill's linked attribute rating", () => {
		// Single skill, linked attribute rating 2, pool of 5.
		// Points 1-2 cost 1 each (rating 0->1, 1->2), point 3+ costs 2 each (rating >= 2).
		// Total affordable: 1+1+2 = 4 (rating 3), remaining 1 point can't afford the next (cost 2).
		const result = randomizeSkills(5, [{ id: "only", linkedAttrRating: 2 }]);
		expect(result.only).toBe(3);
	});

	it("is deterministic under an injected RNG", () => {
		const scripted = [0, 0.99, 0.5, 0.2, 0.8, 0.1];
		let call = 0;
		const rng = () => scripted[call++ % scripted.length]!;

		const first = randomizeSkills(10, skills(4, 3), rng);
		call = 0;
		const second = randomizeSkills(10, skills(4, 3), rng);

		expect(first).toEqual(second);
	});

	it("allows a ticked skill to end at rating 0 when the pool can't reach it", () => {
		// Pool of 0 — no skill should ever be funded.
		const result = randomizeSkills(0, skills(3, 4));

		for (const rating of Object.values(result)) {
			expect(rating).toBe(0);
		}
	});

	it("includes every ticked skill in the result, even unfunded ones", () => {
		const result = randomizeSkills(1, skills(5, 4));
		expect(Object.keys(result)).toHaveLength(5);
	});
});

describe("totalCostForRating", () => {
	it("sums 1 point per level below the linked attribute rating", () => {
		expect(totalCostForRating(3, 6)).toBe(3);
	});

	it("sums 2 points per level at or above the linked attribute rating", () => {
		// linkedAttrRating 2: levels 0,1 cost 1 each; levels 2,3 cost 2 each
		expect(totalCostForRating(4, 2)).toBe(1 + 1 + 2 + 2);
	});

	it("costs nothing for rating 0", () => {
		expect(totalCostForRating(0, 6)).toBe(0);
	});
});
