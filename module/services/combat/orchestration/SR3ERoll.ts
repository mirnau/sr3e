import type { RollSnapshot } from "../engine/types";

type DieResult = { result: number; total?: number; active?: boolean };
type DieTerm = { results?: DieResult[] };
type FoundryRoll = {
    evaluate: () => Promise<unknown>;
    terms: DieTerm[];
    toMessage: (data?: Record<string, unknown>) => Promise<unknown>;
};

export class SR3ERoll {
    readonly formula: string;
    private readonly tn: number | null;
    readonly options: { targetNumber: number | null; [k: string]: unknown };
    private _terms: DieTerm[] = [];
    private _foundryRoll: FoundryRoll | null = null;

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
        const roll = new Roll(this.formula, this.options as Record<string, unknown>) as unknown as FoundryRoll;
        await roll.evaluate();
        this._terms = roll.terms;
        this._foundryRoll = roll;
        return this;
    }

    async toMessage(data: Record<string, unknown> = {}): Promise<void> {
        await this._foundryRoll?.toMessage(data);
    }

    get terms(): DieTerm[] {
        return this._terms;
    }

    get foundryRoll(): FoundryRoll | null {
        return this._foundryRoll;
    }

    private activeResults(): DieResult[] {
        return this._terms.flatMap(t => t.results ?? []).filter(r => r.active !== false);
    }

    countSuccesses(): number | null {
        if (this.tn === null) return null;
        const tn = this.tn;
        return this.activeResults().filter(r => (r.total ?? r.result) >= tn).length;
    }

    isGlitch(): boolean {
        if (this.tn === null) return false;
        const results = this.activeResults();
        return results.length > 0 && results.every(r => (r.total ?? r.result) === 1);
    }

    toSnapshot(): RollSnapshot {
        return {
            terms: this._terms,
            options: { ...this.options },
            meta: { flavor: "", procedureKind: "" },
        };
    }
}
