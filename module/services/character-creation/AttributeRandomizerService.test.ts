import { describe, expect, it } from "vitest";
import { BUYABLE_ATTRIBUTES, randomizeAttributes, type RacialLimits } from "./AttributeRandomizerService";

function limits(max: number): RacialLimits {
	return BUYABLE_ATTRIBUTES.reduce((acc, key) => {
		acc[key] = max;
		return acc;
	}, {} as RacialLimits);
}

function sum(values: Record<string, number>): number {
	return Object.values(values).reduce((total, value) => total + value, 0);
}

describe("randomizeAttributes", () => {
	it("spends the entire pool when headroom is available", () => {
		const result = randomizeAttributes(24, limits(6));

		expect(sum(result) - BUYABLE_ATTRIBUTES.length).toBe(24);
	});

	it("never exceeds any attribute's racial maximum", () => {
		const racialLimits = limits(6);
		const result = randomizeAttributes(24, racialLimits);

		for (const key of BUYABLE_ATTRIBUTES) {
			expect(result[key]).toBeLessThanOrEqual(racialLimits[key]);
		}
	});

	it("never drops any attribute below the baseline of 1", () => {
		const result = randomizeAttributes(24, limits(6));

		for (const key of BUYABLE_ATTRIBUTES) {
			expect(result[key]).toBeGreaterThanOrEqual(1);
		}
	});

	it("caps every attribute and stops early when the pool exceeds total headroom", () => {
		// Headroom to cap: 6 attributes x (6 - 1) = 30. Pool of 100 must not overflow.
		const racialLimits = limits(6);
		const result = randomizeAttributes(100, racialLimits);

		for (const key of BUYABLE_ATTRIBUTES) {
			expect(result[key]).toBe(racialLimits[key]);
		}
	});

	it("is deterministic under an injected RNG", () => {
		const scripted = [0, 0.99, 0.5, 0.2, 0.8, 0.1];
		let call = 0;
		const rng = () => scripted[call++ % scripted.length]!;

		const first = randomizeAttributes(10, limits(6), rng);
		call = 0;
		const second = randomizeAttributes(10, limits(6), rng);

		expect(first).toEqual(second);
	});

	it("respects per-attribute racial limits (not just a uniform cap)", () => {
		const racialLimits: RacialLimits = {
			strength: 2,
			quickness: 6,
			body: 6,
			charisma: 6,
			intelligence: 6,
			willpower: 6,
		};

		const result = randomizeAttributes(20, racialLimits);

		expect(result.strength).toBeLessThanOrEqual(2);
		expect(sum(result) - BUYABLE_ATTRIBUTES.length).toBe(20);
	});
});
