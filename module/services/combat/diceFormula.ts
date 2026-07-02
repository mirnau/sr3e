import { sumMods, poolCap, poolForbidden } from "./modifierList";
import type { Modifier } from "./modifierList";

export type RollState = {
    dice: number;
    poolDice: number;
    focusDice?: number;
    focusKey?: string;
    focusLabel?: string;
    karmaDice: number;
    targetNumber: number;
    modifiers: Modifier[];
};

export function computePoolDice(state: RollState, available: number): number {
    if (poolForbidden(state.modifiers)) return 0;
    return Math.min(state.poolDice, poolCap(state.modifiers), available);
}

export function computeFinalTN(state: RollState, floor?: number): number {
    const raw = state.targetNumber + sumMods(state.modifiers);
    return floor !== undefined ? Math.max(floor, raw) : raw;
}

function totalPool(state: RollState): number {
    return state.dice + computePoolDice(state, state.poolDice) + (state.focusDice ?? 0) + state.karmaDice;
}

export function buildFormula(state: RollState): string {
    const total = totalPool(state);
    if (total <= 0) return "0d6";
    const tn = computeFinalTN(state, 2);
    return `${total}d6x${tn}`;
}

export function buildInfiniteFormula(pool: number): string {
    if (pool <= 0) return "0d6";
    return `${pool}d6x`;
}

export function buildInitiativeFormula(pool: number): string {
    if (pool <= 0) return "0d6";
    return `${pool}d6`;
}
