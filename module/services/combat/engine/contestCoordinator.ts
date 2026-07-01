import type SR3EActor from "../../../documents/SR3EActor";
import type { ContestStub, ContestExport, DefenseHint, RollSnapshot, SerializedProcedure } from "./types";

export type ContestPhase = "awaiting-response" | "resolved" | "cancelled";

export type ContestRecord = {
    id: string;
    initiator: { actorId: string; userId: string };
    target: SR3EActor;
    initiatorRoll: RollSnapshot;
    targetRoll: RollSnapshot | null;
    procedure: SerializedProcedure;
    exportCtx: ContestExport;
    defenseHint: DefenseHint;
    phase: ContestPhase;
    tokenRef: { tokenId: string | null; sceneId: string | null };
};

const activeContests = new Map<string, ContestRecord>();
const pendingResponses = new Map<string, (data: RollSnapshot) => void>();

const ABORT_SENTINEL = "__aborted" as const;

export function startContest(
    serialized: SerializedProcedure,
    exportCtx: ContestExport,
    defenseHint: DefenseHint,
    targetActor: SR3EActor,
    targetToken: { id?: string; scene?: { id?: string } } | null,
    initiatorRoll: RollSnapshot,
): { contestId: string; stub: ContestStub } {
    const contestId = `contest:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const a = targetActor as unknown as { id: string };

    const record: ContestRecord = {
        id: contestId,
        initiator: { actorId: serialized.actor.id, userId: ((game.user as unknown as { id?: string })?.id ?? "") },
        target: targetActor,
        initiatorRoll,
        targetRoll: null,
        procedure: serialized,
        exportCtx,
        defenseHint,
        phase: "awaiting-response",
        tokenRef: {
            tokenId: targetToken?.id ?? null,
            sceneId: targetToken?.scene?.id ?? null,
        },
    };

    activeContests.set(contestId, record);

    const stub: ContestStub = {
        contestId,
        initiator: record.initiator,
        target: {
            actorId: a.id,
            name: (targetActor as unknown as { name: string }).name,
            tokenId: record.tokenRef.tokenId,
            sceneId: record.tokenRef.sceneId,
        },
        initiatorRoll,
        procedureKind: serialized.kind,
        exportCtx,
        defenseHint,
    };

    if (typeof game !== "undefined" && (game as unknown as Record<string, unknown>).socket) {
        ((game as unknown as Record<string, unknown>).socket as { emit: (event: string, data: unknown) => void })
            .emit("system.sr3e", { type: "contestStub", stub });
    }

    return { contestId, stub };
}

export function registerContestStub(stub: ContestStub): ContestRecord {
    const target = (game.actors?.get(stub.target.actorId) as unknown as SR3EActor | undefined);
    if (!target) throw new Error(`Cannot resolve target actor: ${stub.target.actorId}`);

    const record: ContestRecord = {
        id: stub.contestId,
        initiator: stub.initiator,
        target,
        initiatorRoll: stub.initiatorRoll,
        targetRoll: null,
        procedure: { schema: 2, kind: stub.procedureKind, actor: { id: stub.initiator.actorId, uuid: "" }, item: { id: null, uuid: null }, rollState: { dice: 0, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] }, exportCtx: stub.exportCtx },
        exportCtx: stub.exportCtx,
        defenseHint: stub.defenseHint,
        phase: "awaiting-response",
        tokenRef: { tokenId: stub.target.tokenId, sceneId: stub.target.sceneId },
    };

    activeContests.set(stub.contestId, record);
    return record;
}

export function waitForResponse(contestId: string): Promise<RollSnapshot> {
    return new Promise((resolve) => {
        pendingResponses.set(contestId, resolve);
    });
}

export function deliverResponse(contestId: string, rollData: RollSnapshot): void {
    const record = activeContests.get(contestId);
    if (record) {
        record.targetRoll = rollData;
        record.phase = "resolved";
    }
    const resolve = pendingResponses.get(contestId);
    if (resolve) {
        pendingResponses.delete(contestId);
        resolve(rollData);
    }
}

export function expireContest(contestId: string): void {
    const record = activeContests.get(contestId);
    if (record) record.phase = "cancelled";
    deliverResponse(contestId, { terms: [], options: { targetNumber: undefined, __aborted: true }, meta: { flavor: "", procedureKind: ABORT_SENTINEL } });
}

export function abortContest(contestId: string, reason: string): void {
    expireContest(contestId);
    if (typeof Hooks !== "undefined") {
        Hooks.call("sr3e.contestAborted", { contestId, reason });
    }
}

export function getContest(contestId: string): ContestRecord | undefined {
    return activeContests.get(contestId);
}

export function countSuccesses(rollData: RollSnapshot): number {
    const tn = rollData.options.targetNumber ?? 0;
    return (rollData.terms as Array<{ results?: Array<{ active?: boolean; result?: number }> }>)
        .flatMap(t => t.results ?? [])
        .filter(r => r.active !== false && (r.result ?? 0) >= tn)
        .length;
}

export function computeNetSuccesses(initiatorRoll: RollSnapshot, targetRoll: RollSnapshot): number {
    return Math.max(0, countSuccesses(initiatorRoll) - countSuccesses(targetRoll));
}

type FoundryUser = { id: string; active?: boolean; isGM?: boolean; character?: { id: string } };
type FoundryActor = { id: string; ownership?: Record<string, number> };

export function resolveControllingUser(actor: SR3EActor): (FoundryUser & Record<string, unknown>) | null {
    if (typeof game === "undefined" || !game.users) return null;

    const users = [...(game.users as unknown as Map<string, FoundryUser>).values()].filter(u => u.active);
    const a = actor as unknown as FoundryActor;

    const assigned = users.find(u => u.character?.id === a.id);
    if (assigned) return assigned as FoundryUser & Record<string, unknown>;

    const owner = users.find(u => !u.isGM && (a.ownership?.[u.id] ?? 0) >= 3);
    if (owner) return owner as FoundryUser & Record<string, unknown>;

    const gm = users.find(u => u.isGM);
    return (gm ?? null) as (FoundryUser & Record<string, unknown>) | null;
}

export function _resetForTest(): void {
    activeContests.clear();
    pendingResponses.clear();
}
