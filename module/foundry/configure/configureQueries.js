import OpposeRollService from "@services/OpposeRollService.js";

export function configureQueries() {
   CONFIG.queries ??= {};

   /**
    * Arrives on remote clients (initiator + target).
    * Register the contest stub locally, then re-render the chat message so buttons appear.
    */
   CONFIG.queries["sr3e.opposeRollPrompt"] = async (stub) => {
      // stub shape:
      // {
      //   contestId,
      //   initiator: { actorId, userId },
      //   target: { actorId, name, tokenId, sceneId },
      //   initiatorRoll,
      //   procedure,   // { class, json, export }
      //   defenseHint,
      // }
      OpposeRollService.registerContestStub(stub);

      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === stub.contestId);
      if (msg) msg.render(true);

      return { acknowledged: true };
   };

   /**
    * The actual resolution call (should run on the initiator's client).
    */
   CONFIG.queries["sr3e.resolveOpposedRoll"] = async ({ contestId, rollData }) => {
      await OpposeRollService.resolveTargetRoll(contestId, rollData);
      return { ok: true };
   };

   /**
    * Relay to the *initiator user* strictly, using the stored initiator.userId on the contest.
    * No initiatorId param needed; we read from the local contest.
    */
   CONFIG.queries["sr3e.resolveOpposedRollRemote"] = async ({ contestId, rollData }) => {
      const contest = OpposeRollService.getContestById(contestId);
      if (!contest) return { ok: false, reason: "no contest" };

      const initiatorUser = game.users.get(contest.initiator?.userId);
      if (!initiatorUser) return { ok: false, reason: "no initiator user" };

      if (initiatorUser.id === game.user.id) {
         // We are the initiator → resolve locally.
         return CONFIG.queries["sr3e.resolveOpposedRoll"]({ contestId, rollData });
      }

      // Not the initiator → forward to that user.
      await initiatorUser.query("sr3e.resolveOpposedRollRemote", { contestId, rollData });
      return { ok: true, relayed: true };
   };

   /**
    * Defender chose "No" → treat as 0-success defense, but still resolve on the initiator.
    */
   CONFIG.queries["sr3e.resolveOpposedNoDodge"] = async ({ contestId }) => {
      const noDodgeRollData = {
         terms: [{ results: [] }],
         options: { targetNumber: 4 },
      };
      // Reuse the same strict relay path
      return CONFIG.queries["sr3e.resolveOpposedRollRemote"]({ contestId, rollData: noDodgeRollData });
   };

   /**
    * Mark the opposed prompt message as responded so it won't re-offer buttons.
    */
   CONFIG.queries["sr3e.markOpposedResponded"] = async ({ messageId }) => {
      const msg = game.messages.get(messageId);
      if (!msg) throw new Error(`sr3e: chat message ${messageId} not found`);

      if (!(game.user.isGM || msg.isAuthor)) {
         throw new Error("sr3e: insufficient permission to update ChatMessage");
      }

      await msg.update({
         flags: {
            ...msg.flags,
            sr3e: { ...(msg.flags?.sr3e || {}), opposedResponded: true },
         },
      });
      return { ok: true };
   };

   /**
    * Abort flow and refresh the prompt message.
    */

   CONFIG.queries["sr3e.cancelOpposedContest"] = async ({ contestId, reason }) => {
      return OpposeRollService.abortOpposedRoll(contestId, { reason, byUserId: game.user.id });
   };

   /**
    * Damage resistance resolution (already runs where invoked).
    */
   CONFIG.queries["sr3e.resolveResistanceRoll"] = async ({ defenderId, weaponId, prep, rollData }) => {
      await OpposeRollService.resolveDamageResistanceFromRoll({ defenderId, weaponId, prep, rollData });
      return { ok: true };
   };
}
