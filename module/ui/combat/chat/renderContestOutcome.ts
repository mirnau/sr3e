import { renderRollSummary } from "./renderRollSummary";
import type { RollSnapshot } from "../../../services/combat/engine/types";

export type ContestRenderCtx = {
    initiator: { name: string };
    target: { name: string };
    weaponName: string;
    initiatorRoll: RollSnapshot;
    targetRoll: RollSnapshot;
    netSuccesses: number;
};

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
    return `<div class="sr3e-contest-outcome">
  <div class="sr3e-contest-header">${ctx.initiator.name} vs ${ctx.target.name} — ${ctx.weaponName}</div>
  ${renderRollSummary(ctx.initiator, ctx.initiatorRoll)}
  ${renderRollSummary(ctx.target, ctx.targetRoll)}
  ${winnerLine(ctx)}
</div>`;
}
