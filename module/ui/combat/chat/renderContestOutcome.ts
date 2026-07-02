import { renderAdvancedRollSummary, extractDieResults, type DieEntry } from "./renderRollSummary";
import type { RollSnapshot } from "../../../services/combat/engine/types";

export type ContestRenderCtx = {
    initiator: { name: string };
    target: { name: string };
    weaponName: string;
    initiatorRoll: RollSnapshot;
    targetRoll: RollSnapshot;
    // Pass the original DieEntry[] (bought/rerolled flags intact) when re-rendering
    // after a buy/reroll — the roll snapshots above are reconstructed synthetically
    // for success-counting only and don't carry those flags through their terms.
    initiatorResults?: DieEntry[];
    targetResults?: DieEntry[];
    netSuccesses: number;
    extraHtml?: string;
};

function renderSide(actor: { name: string }, roll: RollSnapshot, results?: DieEntry[]): string {
    return renderAdvancedRollSummary(actor, roll, results ?? extractDieResults(roll.terms));
}

function winnerLine(ctx: ContestRenderCtx): string {
    if (ctx.netSuccesses > 0) {
        return `<div class="sr3e-contest-winner sr3e-attacker-wins">${ctx.initiator.name} wins — ${ctx.netSuccesses} net success${ctx.netSuccesses !== 1 ? "es" : ""}</div>`;
    }
    if (ctx.netSuccesses < 0) {
        return `<div class="sr3e-contest-winner sr3e-defender-wins">${ctx.target.name} wins — ${Math.abs(ctx.netSuccesses)} net success${Math.abs(ctx.netSuccesses) !== 1 ? "es" : ""}</div>`;
    }
    return `<div class="sr3e-contest-winner sr3e-tie">Tie — defender wins ties</div>`;
}

export function renderContestOutcome(ctx: ContestRenderCtx): string {
    const header = ctx.weaponName
        ? `${ctx.initiator.name} vs ${ctx.target.name} — ${ctx.weaponName}`
        : `${ctx.initiator.name} vs ${ctx.target.name}`;
    return `<div class="sr3e-contest-outcome">
  <div class="sr3e-contest-header">${header}</div>
  <div class="sr3e-contest-side" data-side="initiator">${renderSide(ctx.initiator, ctx.initiatorRoll, ctx.initiatorResults)}</div>
  <div class="sr3e-contest-side" data-side="target">${renderSide(ctx.target, ctx.targetRoll, ctx.targetResults)}</div>
  ${winnerLine(ctx)}
  ${ctx.extraHtml ?? ""}
</div>`;
}
