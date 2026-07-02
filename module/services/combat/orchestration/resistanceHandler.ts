import { executeResistanceRoll } from "./resistanceFlow";
import { openComposer } from "../procedures/composerService";
import { canCurrentUserActFor } from "../engine/contestCoordinator";
import type { ResistancePrep, RollSnapshot } from "../engine/types";
import type { ProcedureSetup } from "../procedures/simpleSetups";

type DefenderLike = {
    system: Record<string, unknown>;
    items?: { contents?: unknown[] };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

function bodyRating(defender: DefenderLike): number {
    const attrs = (defender.system as { attributes?: Record<string, { value?: number; total?: number }> }).attributes ?? {};
    return attrs.body?.total ?? attrs.body?.value ?? 1;
}

export function buildResistanceSetup(defender: DefenderLike, prep: ResistancePrep): ProcedureSetup {
    const dice = Math.max(1, bodyRating(defender));
    const targetNumber = Math.max(2, prep.tnBase + prep.tnMods.reduce((s, m) => s + m.value, 0));

    return {
        kind: "resistance",
        title: "Resistance Roll",
        rollState: { dice, poolDice: 0, karmaDice: 0, targetNumber, modifiers: [] },
        lockPriority: "simple",
        // The interactive resistance message posted by executeResistanceRoll
        // IS this roll's chat presence — advancedFlow's own generic
        // roll-summary message (with its own independent reroll flag) would
        // duplicate it and could desync from the resistance-specific reroll.
        selfPublish: false,
        defenseHint: null,
        exportFn: () => ({
            familyKey: "resistance",
            weaponId: null,
            weaponName: prep.weaponName,
            plan: null,
            damage: null,
            tnBase: prep.tnBase,
            tnMods: prep.tnMods,
            next: { kind: "", ui: {}, args: {} },
        }),
        commitFn: async (roll: unknown) => {
            await executeResistanceRoll(prep, defender, roll as RollSnapshot);
        },
    };
}

export type ResistanceCtx = {
    prep: ResistancePrep;
    defenderActorId: string;
};

export function handleResistanceClick(ctx: ResistanceCtx): void {
    if (typeof game === "undefined" || !game.actors) return;
    const defender = game.actors.get(ctx.defenderActorId) as DefenderLike | undefined;
    if (!defender) return;
    // A GM viewing this (whispered) prompt must not roll on behalf of an
    // actively-controlling player — same rule as reroll/buy/done.
    if (!canCurrentUserActFor(defender as never)) return;
    openComposer(buildResistanceSetup(defender, ctx.prep) as never, defender);
}
