import { registerContestStub, expireContest, getContest } from "../engine/contestCoordinator";
import { buildDodgeSetup, buildMeleeDefenseSetup } from "../procedures/defenseSetups";
import { openComposer } from "../procedures/composerService";
import { renderDefenderPrompt } from "../../../ui/combat/chat/renderDefenderPrompt";
import type { ContestStub, DefenseHint } from "../engine/types";
import type { MeleeDefenseBasis, MeleeDefenseMode } from "../procedures/defenseSetups";

type AttributeMap = Record<string, { value?: number; total?: number }>;
type ActorSystem = { attributes?: AttributeMap };
type ActorLike = {
    id: string;
    system: Record<string, unknown>;
    items?: { get?: (id: string) => unknown; contents?: unknown[] };
};

function resolveActor(actorId: string): ActorLike | null {
    if (typeof game === "undefined" || !game.actors) return null;
    return (game.actors.get(actorId) as ActorLike | undefined) ?? null;
}

function resolveActorName(actorId: string): string {
    if (typeof game === "undefined" || !game.actors) return "Attacker";
    return ((game.actors.get(actorId) as unknown as { name?: string }) ?? {}).name ?? "Attacker";
}

function resolveMeleeBasis(actor: ActorLike, hint: DefenseHint): MeleeDefenseBasis {
    if (hint.type === "attribute") {
        const attrs = (actor.system as ActorSystem).attributes ?? {};
        const attr = attrs[hint.key];
        const dice = attr?.total ?? attr?.value ?? 0;
        return { type: "attribute", key: hint.key, name: hint.tnLabel, dice };
    }

    const items = (actor.items?.contents ?? []) as Array<{ id: string; type: string; system: Record<string, unknown> }>;
    const skill = items.find(i => i.type === "skill" && i.id === hint.key)
        ?? items.find(i => i.type === "skill" && (i.system as Record<string, unknown>).name === hint.key);

    const dice = (skill?.system as { value?: number } | undefined)?.value ?? 0;
    return { type: "skill", key: hint.key, name: hint.tnLabel, dice, id: skill?.id };
}

function currentUserIsGM(): boolean {
    if (typeof game === "undefined" || !game.user) return false;
    return !!(game.user as unknown as { isGM?: boolean }).isGM;
}

type ChatMessageStatic = { create: (data: Record<string, unknown>) => Promise<unknown> };

async function sendDefenderPrompt(stub: ContestStub): Promise<void> {
    if (!currentUserIsGM()) return;

    const attackerName = resolveActorName(stub.initiator.actorId);
    const html = renderDefenderPrompt(
        stub.contestId,
        stub.target.name,
        attackerName,
        stub.exportCtx.weaponName,
        stub.exportCtx.next.kind,
    );

    const userId = (game.user as unknown as { id: string }).id;
    await (ChatMessage as unknown as ChatMessageStatic).create({
        content: html,
        whisper: [userId],
        flags: { sr3e: { opposed: stub.contestId } },
    });
}

export async function handleContestStub(stub: ContestStub): Promise<void> {
    const defender = resolveActor(stub.target.actorId);

    if (!defender) {
        expireContest(stub.contestId);
        return;
    }

    registerContestStub(stub);
    await sendDefenderPrompt(stub);
}

export function handleDefenderChoice(contestId: string, key: string | null | undefined): void {
    if (!key || key === "no") {
        expireContest(contestId);
        return;
    }

    const record = getContest(contestId);
    if (!record) {
        expireContest(contestId);
        return;
    }

    const defender = record.target as unknown as ActorLike;

    if (key === "dodge") {
        openComposer(buildDodgeSetup(defender, contestId) as never, defender);
        return;
    }

    const basis = resolveMeleeBasis(defender, record.defenseHint);
    const mode: MeleeDefenseMode = key === "full" ? "full" : "standard";
    openComposer(buildMeleeDefenseSetup(defender, basis, mode, contestId) as never, defender);
}
