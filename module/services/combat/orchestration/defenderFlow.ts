import { registerContestStub, expireContest, getContest, resolveControllingUser, canCurrentUserActFor } from "../engine/contestCoordinator";
import { buildDodgeSetup, buildMeleeDefenseSetup, buildSpellResistanceSetup } from "../procedures/defenseSetups";
import { openComposer } from "../procedures/composerService";
import { registerPendingResponse } from "../engine/responseInterceptor";
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

type SheetLike = { rendered?: boolean; render?: (force: boolean) => void };

function ensureSheetOpen(actor: ActorLike): void {
    const sheet = (actor as unknown as { sheet?: SheetLike }).sheet;
    if (sheet && !sheet.rendered) sheet.render?.(true);
}

type ChatMessageStatic = { create: (data: Record<string, unknown>) => Promise<unknown> };

async function sendDefenderPrompt(stub: ContestStub, defender: ActorLike): Promise<void> {
    if (!currentUserIsGM()) return;

    const controller = resolveControllingUser(defender as never);
    if (!controller) return;

    const attackerName = resolveActorName(stub.initiator.actorId);
    const html = renderDefenderPrompt(
        stub.contestId,
        stub.target.name,
        attackerName,
        stub.exportCtx.weaponName,
        stub.exportCtx.next.kind,
    );

    await (ChatMessage as unknown as ChatMessageStatic).create({
        content: html,
        whisper: [controller.id as string],
        flags: { sr3e: { opposed: stub.contestId } },
    });
}

export async function handleContestStub(stub: ContestStub): Promise<void> {
    const defender = resolveActor(stub.target.actorId);

    if (!defender) {
        expireContest(stub.contestId);
        return;
    }

    if (!getContest(stub.contestId)) {
        registerContestStub(stub);
    }

    await sendDefenderPrompt(stub, defender);
}

async function postContestCancelled(defenderName: string): Promise<void> {
    if (typeof ChatMessage !== "undefined") {
        await (ChatMessage as any).create?.({ content: `<p><strong>${defenderName}</strong> declined the contest.</p>` });
    }
}

export function handleDefenderChoice(contestId: string, key: string | null | undefined): void {
    const record = getContest(contestId);

    // A GM viewing this prompt (whispered to whoever resolveControllingUser
    // picked) must not be able to answer on behalf of an actively-controlling
    // player — same rule as reroll/buy/done everywhere else.
    if (record && !canCurrentUserActFor(record.target)) return;

    if (!key || key === "no") {
        const name = (record?.target as unknown as { name?: string })?.name ?? "Defender";
        expireContest(contestId);
        void postContestCancelled(name);
        return;
    }

    if (!record) {
        expireContest(contestId);
        return;
    }

    const defender = record.target as unknown as ActorLike;

    if (key === "accept") {
        registerPendingResponse((defender as unknown as { id: string }).id, contestId);
        ensureSheetOpen(defender);
        return;
    }

    if (key === "dodge") {
        openComposer(buildDodgeSetup(defender, contestId) as never, defender);
        ensureSheetOpen(defender);
        return;
    }

    if (key === "spell-resistance") {
        openComposer(buildSpellResistanceSetup(defender, contestId) as never, defender);
        ensureSheetOpen(defender);
        return;
    }

    const basis = resolveMeleeBasis(defender, record.defenseHint);
    const mode: MeleeDefenseMode = key === "full" ? "full" : "standard";
    openComposer(buildMeleeDefenseSetup(defender, basis, mode, contestId) as never, defender);
    ensureSheetOpen(defender);
}
