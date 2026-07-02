import { deliverResponse, abortContest, resolveBothDone } from "../engine/contestCoordinator";
import { handleContestStub } from "./defenderFlow";
import { updateMessageAsGM } from "./messageRelay";
import { applyContestSideDelta, applyContestDone, type ContestOutcomeFlag, type ContestSide, type ContestSideDelta } from "./contestRerollHandler";
import { applyDrainDelta, type DrainOutcomeFlag, type DrainDelta } from "../../spells/drainRerollHandler";
import type { ContestStub, RollSnapshot } from "../engine/types";

const FULL_DEFENSE_FLAG = "fullDefenseActive";
const SOCKET_EVENT = "system.sr3e";

type SocketPayload =
    | { type: "contestStub"; stub: ContestStub }
    | { type: "contestResponse"; contestId: string; roll: RollSnapshot }
    | { type: "contestAbort"; contestId: string; reason: string }
    | { type: "updateChatMessage"; messageId: string; data: Record<string, unknown> }
    | { type: "contestSideUpdate"; messageId: string; delta: ContestSideDelta; fallback: ContestOutcomeFlag }
    | { type: "contestDone"; messageId: string; side: ContestSide; fallback: ContestOutcomeFlag }
    | { type: "contestBothDone"; contestId: string; finalFlag: ContestOutcomeFlag }
    | { type: "drainUpdate"; messageId: string; delta: DrainDelta; fallback: DrainOutcomeFlag };

export function registerSocketHandlers(): void {
    if (typeof game === "undefined" || !game.socket) return;

    (game.socket as unknown as { on: (event: string, handler: (payload: unknown) => void) => void })
        .on(SOCKET_EVENT, (payload: unknown) => {
            const p = payload as SocketPayload;
            if (p.type === "contestStub") {
                void handleContestStub(p.stub);
            } else if (p.type === "contestResponse") {
                deliverResponse(p.contestId, p.roll);
            } else if (p.type === "contestAbort") {
                abortContest(p.contestId, p.reason);
            } else if (p.type === "updateChatMessage") {
                void updateMessageAsGM(p.messageId, p.data);
            } else if (p.type === "contestSideUpdate") {
                void applyContestSideDelta(p.messageId, p.delta, p.fallback);
            } else if (p.type === "contestDone") {
                void applyContestDone(p.messageId, p.side, p.fallback);
            } else if (p.type === "contestBothDone") {
                resolveBothDone(p.contestId, p.finalFlag);
            } else if (p.type === "drainUpdate") {
                void applyDrainDelta(p.messageId, p.delta, p.fallback);
            }
        });
}

function clearFullDefenseFlag(actor: { unsetFlag?: (scope: string, key: string) => Promise<void> }): void {
    actor.unsetFlag?.("sr3e", FULL_DEFENSE_FLAG)?.catch(() => {});
}

export function registerPoolRefreshHook(): void {
    if (typeof Hooks === "undefined") return;

    Hooks.on("updateCombat", async (combat: unknown, changed: Record<string, unknown>) => {
        if (!("round" in changed)) return;
        const cbt = combat as { combatants?: { contents?: Array<{ actor?: { update?: (d: Record<string, unknown>) => Promise<void> } }> } };
        const combatants = cbt.combatants?.contents ?? [];
        for (const combatant of combatants) {
            await combatant.actor?.update?.({
                "system.dicePools.combat.spent": 0,
                "system.dicePools.astral.spent": 0,
                "system.dicePools.hacking.spent": 0,
                "system.dicePools.control.spent": 0,
                "system.dicePools.spell.spent": 0,
            });
        }
    });
}

export function registerCombatTurnHook(): void {
    if (typeof Hooks === "undefined") return;

    Hooks.on("combatTurn", (_combat: unknown, combatData: Record<string, unknown>) => {
        const combatantId = combatData.combatantId as string | undefined;
        if (!combatantId || typeof game === "undefined" || !game.combat) return;

        const combatants = (game.combat as unknown as { combatants?: { get: (id: string) => unknown } }).combatants;
        const combatant = combatants?.get(combatantId) as unknown as { actor?: { unsetFlag?: (scope: string, key: string) => Promise<void> } } | undefined;
        if (combatant?.actor) clearFullDefenseFlag(combatant.actor);
    });
}
