import { acquireLock, releaseLock } from "../engine/procedureLock";
import { computeFinalTN, computePoolDice } from "../diceFormula";
import { SR3ERoll } from "./SR3ERoll";
import { executeSimpleFlow } from "./simpleFlow";
import { executeAdvancedFlow } from "./advancedFlow";
import { executeContestedFlow } from "./contestedFlow";
import { openComposer } from "../procedures/composerService";
import { buildSpellDrainSetup, isSpellcastingSetup } from "../../spells/spellDrain";
import type { ProcedureSetup } from "../procedures/simpleSetups";
import type { RollState } from "../diceFormula";

const FULL_DEFENSE_FLAG = "fullDefenseActive";

function getFullDefenseFlag(actor: { id: string }): boolean {
    if (typeof game === "undefined" || !game.actors) return false;
    const a = game.actors.get(actor.id) as unknown as { getFlag?: (scope: string, key: string) => unknown } | undefined;
    return !!(a?.getFlag?.("sr3e", FULL_DEFENSE_FLAG));
}

function computePool(state: RollState): number {
    return state.dice + computePoolDice(state, state.poolDice) + (state.focusDice ?? 0) + state.karmaDice;
}

export type ExecuteProcedureOptions = {
    targets?: Array<{ id?: string; scene?: { id?: string }; actor?: { id: string; system: Record<string, unknown>; items?: unknown } }>;
    fullDefenseOverride?: boolean;
    rollState?: RollState;
    poolKey?: string;
    advanced?: boolean;
};

export async function executeProcedure(
    setup: ProcedureSetup,
    actor: { id: string; system: Record<string, unknown> },
    opts: ExecuteProcedureOptions = {},
): Promise<{ succeeded: boolean; reason?: string }> {
    if (getFullDefenseFlag(actor) || opts.fullDefenseOverride) {
        return { succeeded: false, reason: "full-defense" };
    }

    const lockKey = `${actor.id}:${setup.kind}`;
    const lockId = acquireLock(lockKey, setup.lockPriority);
    if (!lockId) return { succeeded: false, reason: "lock-denied" };

    try {
        const state = opts.rollState ?? setup.rollState;
        const pool = computePool(state);

        const roll = setup.openRoll
            ? SR3ERoll.buildOpen(pool)
            : SR3ERoll.build(pool, computeFinalTN(state, 2));
        await roll.evaluate();

        const isContested = !!setup.defenseHint && (opts.targets?.length ?? 0) > 0;

        if (isContested) {
            await executeContestedFlow(setup, state, roll, actor, opts.targets ?? []);
        } else if (opts.advanced && !setup.openTest) {
            await executeAdvancedFlow(setup, state, roll, actor, { poolKey: opts.poolKey });
        } else {
            await executeSimpleFlow(setup, state, roll, actor, { poolKey: opts.poolKey });
        }

        if (isSpellcastingSetup(setup)) {
            openComposer(buildSpellDrainSetup(actor as never, setup.extraOptions!.spell as never), actor);
        }

        return { succeeded: true };
    } finally {
        releaseLock(lockKey);
    }
}
