// configureQueries.js
import OpposeRollService from "@services/OpposeRollService.js";

export function configureQueries() {
  CONFIG.queries ??= {};

  // Arrives on remote clients (initiator + target)
  CONFIG.queries["sr3e.opposeRollPrompt"] = async (stub) => {
    OpposeRollService.registerContestStub(stub);
    const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === stub.contestId);
    if (msg) msg.render(true);
    return { acknowledged: true };
  };

  // Must run on the initiator’s client
  CONFIG.queries["sr3e.resolveOpposedRoll"] = async ({ contestId, rollData }) => {
    await OpposeRollService.resolveTargetRoll(contestId, rollData);
    return { ok: true };
  };

  // Relay to *initiator user* only
  CONFIG.queries["sr3e.resolveOpposedRollRemote"] = async ({ contestId, rollData }) => {
    const contest = OpposeRollService.getContestById(contestId);
    if (!contest) return { ok: false, reason: "no contest" };

    const initiatorUser = game.users.get(contest.initiator?.userId);
    if (!initiatorUser) return { ok: false, reason: "no initiator user" };

    if (initiatorUser.id === game.user.id) {
      return CONFIG.queries["sr3e.resolveOpposedRoll"]({ contestId, rollData });
    }
    await initiatorUser.query("sr3e.resolveOpposedRollRemote", { contestId, rollData });
    return { ok: true, relayed: true };
  };

  // “No/Decline” → 0 successes at TN 4 (hardcoded)
  CONFIG.queries["sr3e.resolveOpposedNoDodge"] = async ({ contestId }) => {
    const noRoll = { terms: [{ results: [] }], options: { targetNumber: 4 } };
    return CONFIG.queries["sr3e.resolveOpposedRollRemote"]({ contestId, rollData: noRoll });
  };

  // Mark the prompt as responded so it won’t re-offer buttons
  CONFIG.queries["sr3e.markOpposedResponded"] = async ({ messageId }) => {
    const msg = game.messages.get(messageId);
    if (!msg) throw new Error(`sr3e: chat message ${messageId} not found`);
    if (!(game.user.isGM || msg.isAuthor)) throw new Error("sr3e: insufficient permission");
    await msg.update({
      flags: { ...msg.flags, sr3e: { ...(msg.flags?.sr3e || {}), opposedResponded: true } },
    });
    return { ok: true };
  };

  // Optional: cancel
  CONFIG.queries["sr3e.cancelOpposedContest"] = async ({ contestId, reason }) => {
    return OpposeRollService.abortOpposedRoll(contestId, { reason, byUserId: game.user.id });
  };
}
