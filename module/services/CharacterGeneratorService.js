export default class CharacterGeneratorService {
	static VALID_PRIORITIES = ["A", "B", "C", "D", "E"];

	static generatePriorityCombination({ metahumanOptions = [], magicOptions = [] } = {}) {
		const priorities = [...this.VALID_PRIORITIES];
		console.log(`sr3d | Randomizer | Initial Priorities: ${priorities.join(", ")}`);

		const weights = {
			metahuman: { E: 64, C: 18, D: 18 },
			magic:     { A: 2, B: 2, C: 32, D: 32, E: 32 }
		};

		const combination = {};

		// If there's only one metahuman, use its actual priority
		const isOnlyOneMeta = metahumanOptions.length === 1;
		combination.metahuman = isOnlyOneMeta
			? this._forcePriority(priorities, metahumanOptions[0].priority)
			: this._draw(priorities, weights.metahuman);

		console.log(`sr3d | Randomizer | Metahuman Priority: ${combination.metahuman}`);

		// Same logic for magic
		const isOnlyOneMagic = magicOptions.length === 1;
		combination.magic = isOnlyOneMagic
			? this._forcePriority(priorities, magicOptions[0].priority)
			: this._draw(priorities, weights.magic);

		console.log(`sr3d | Randomizer | Magic Priority: ${combination.magic}`);

		// Assign remaining priorities
		["attribute", "skills", "resources"].forEach(type => {
			combination[type] = this._draw(priorities);
		});

		console.log("sr3d | Randomizer | Final Combination:", combination);
		return combination;
	}

	static _draw(priorities, weightMap = null) {
		if (!priorities.length) throw new Error("No valid priorities remaining.");

		let choice;
		if (weightMap) {
			const pool = priorities.flatMap(p => Array(weightMap[p] || 0).fill(p));
			if (!pool.length) throw new Error("Weighted pool is empty.");
			choice = pool[Math.floor(Math.random() * pool.length)];
		} else {
			choice = priorities[Math.floor(Math.random() * priorities.length)];
		}

		priorities.splice(priorities.indexOf(choice), 1);
		return choice;
	}

	static _forcePriority(priorities, forced) {
		const index = priorities.indexOf(forced);
		if (index === -1) throw new Error(`Forced priority "${forced}" not available.`);
		priorities.splice(index, 1);
		return forced;
	}
}
