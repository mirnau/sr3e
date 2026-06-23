import type { RollSnapshot } from "../engine/types";

type DieResult = { result: number; active?: boolean };
type DieTerm = { results?: DieResult[] };

export class SR3ERoll {
    readonly formula: string;
    private readonly tn: number | null;
    readonly options: { targetNumber: number | null; [k: string]: unknown };
    private _terms: DieTerm[] = [];

    private constructor(formula: string, tn: number | null, options: Record<string, unknown> = {}) {
        this.formula = formula;
        this.tn = tn;
        this.options = { ...options, targetNumber: tn };
    }

    static build(pool: number, tn: number, options: Record<string, unknown> = {}): SR3ERoll {
        return new SR3ERoll(`${Math.max(0, pool)}d6x${tn}`, tn, options);
    }

    static buildOpen(pool: number, options: Record<string, unknown> = {}): SR3ERoll {
        return new SR3ERoll(`${Math.max(0, pool)}d6x`, null, options);
    }

    async evaluate(): Promise<this> {
        const roll = new Roll(this.formula, this.options as Record<string, unknown>);
        await roll.evaluate();
        this._terms = (roll as unknown as { terms: DieTerm[] }).terms;
        return this;
    }

    get terms(): DieTerm[] {
        return this._terms;
    }

    private activeResults(): DieResult[] {
        return this._terms.flatMap(t => t.results ?? []).filter(r => r.active !== false);
    }

    countSuccesses(): number | null {
        if (this.tn === null) return null;
        const tn = this.tn;
        return this.activeResults().filter(r => r.result >= tn).length;
    }

    isGlitch(): boolean {
        if (this.tn === null) return false;
        const results = this.activeResults();
        return results.length > 0 && results.every(r => r.result === 1);
    }

    toSnapshot(): RollSnapshot {
        return {
            terms: this._terms,
            options: { ...this.options },
            meta: { flavor: "", procedureKind: "" },
        };
    }
}
