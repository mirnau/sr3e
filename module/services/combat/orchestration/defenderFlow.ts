import { registerContestStub, expireContest, getContest, resolveControllingUser, canCurrentUserActFor, submitContestResponse } from "../engine/contestCoordinator";
import { buildDodgeSetup, buildMeleeDefenseSetup, buildSpellResistanceSetup } from "../procedures/defenseSetups";
import { buildAttributeSetup, buildSkillSetup, type ProcedureSetup } from "../procedures/simpleSetups";
import { openComposer } from "../procedures/composerService";
import { registerPendingResponse, claimPendingResponse } from "../engine/responseInterceptor";
import { renderDefenderPrompt } from "../../../ui/combat/chat/renderDefenderPrompt";
import type { ContestStub, DefenseHint, RollSnapshot } from "../engine/types";
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

// A challenge's defender is a different actor with different skill item
// ids, so the initiator's skillId won't resolve on their sheet — fall back
// to matching by the base skill's own name (carried in next.args.skillName).
function resolveSkillIdOnActor(actor: ActorLike, skillId: string | undefined, skillName: string | undefined): string | undefined {
    const items = (actor.items?.contents ?? []) as Array<{ id: string; type: string; name?: string }>;
    const byId = skillId ? items.find(i => i.type === "skill" && i.id === skillId) : undefined;
    if (byId) return byId.id;
    return skillName ? items.find(i => i.type === "skill" && i.name === skillName)?.id : undefined;
}

// Rewires a setup built for INITIATING a roll into one that submits its
// result as this contest's response instead — same override AttributeCard/
// SkillCard apply client-side when a player manually claims a pending
// response, reused here so "Accept" can open the composer automatically.
function asResponseSetup(setup: ProcedureSetup, contestId: string): ProcedureSetup {
    return {
        ...setup,
        selfPublish: false,
        defenseHint: null,
        commitFn: async (roll: unknown) => {
            submitContestResponse(contestId, roll as RollSnapshot);
        },
    };
}

// Attribute and skill challenges (next.kind "attribute-response" /
// "skill-response") pre-fill the defender's composer with the SAME
// attribute/skill the initiator used, opened immediately on Accept — the
// player is still free to close it and roll something else entirely via
// their own sheet instead (registerPendingResponse stays live for exactly
// that override path; see AttributeCard.svelte/SkillCard.svelte).
function tryOpenPrefilledResponseComposer(record: NonNullable<ReturnType<typeof getContest>>, defender: ActorLike, contestId: string): boolean {
    const next = record.exportCtx.next;

    if (next.kind === "attribute-response") {
        const attributeKey = next.args.attributeKey as string | undefined;
        if (!attributeKey) return false;
        const setup = buildAttributeSetup(defender as never, attributeKey);
        openComposer(asResponseSetup(setup, contestId) as never, defender);
        return true;
    }

    if (next.kind === "skill-response") {
        const skillId = resolveSkillIdOnActor(defender, next.args.skillId as string | undefined, next.args.skillName as string | undefined);
        if (!skillId) return false;
        const setup = buildSkillSetup(defender as never, skillId);
        openComposer(asResponseSetup(setup, contestId) as never, defender);
        return true;
    }

    return false;
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
        const defenderId = (defender as unknown as { id: string }).id;
        registerPendingResponse(defenderId, contestId);
        if (tryOpenPrefilledResponseComposer(record, defender, contestId)) {
            claimPendingResponse(defenderId);
        }
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
