import { executeResistanceRoll } from "./resistanceFlow";
import { openComposer } from "../procedures/composerService";
import type { ResistancePrep } from "../engine/types";
import type { RollState } from "../diceFormula";
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
        selfPublish: true,
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
        commitFn: async (rollState: unknown) => {
            await executeResistanceRoll(prep, defender, rollState as RollState);
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
    openComposer(buildResistanceSetup(defender, ctx.prep) as never);
}
