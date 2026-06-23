import { accumulate } from "../../services/combat/orchestration/sr3eDiceEngine";
import type { DieResult } from "../../services/combat/orchestration/sr3eDiceEngine";

const EXPLODE_PATTERN = /^x(\d*)$/;

type AnyDie = foundry.dice.terms.Die & {
    modifiers: string[];
    results: (DieResult & { discarded?: boolean })[];
};

export default class SR3Edie extends foundry.dice.terms.Die {
    static override DENOMINATION = "d";

    // Disable Foundry's native explode — we handle accumulation ourselves
    static override MODIFIERS = Object.assign(
        {},
        foundry.dice.terms.Die.MODIFIERS,
        { x: function(this: unknown, _mod: string) { return this; } },
    ) as typeof foundry.dice.terms.Die.MODIFIERS;

    override _evaluate({ maximize = false, minimize = false }: { maximize?: boolean; minimize?: boolean } = {}): this {
        const self = this as unknown as AnyDie;
        const pool = this.number ?? 0;
        const explodeMod = self.modifiers.find(m => EXPLODE_PATTERN.test(m)) ?? null;

        if (!explodeMod || maximize || minimize) {
            self.results = [];
            for (let i = 0; i < pool; i++) {
                const face = maximize ? 6 : minimize ? 1 : Math.floor(Math.random() * 6) + 1;
                self.results.push({ result: face, active: true, exploded: false });
            }
            return this;
        }

        const capStr = EXPLODE_PATTERN.exec(explodeMod)?.[1] ?? "";
        const cap = capStr.length > 0 ? Math.max(2, parseInt(capStr, 10)) : Infinity;

        self.results = accumulate(pool, cap);
        return this;
    }

    static Register(): void {
        (CONFIG.Dice.terms as Record<string, unknown>)["d"] = SR3Edie;
    }
}
