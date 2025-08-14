import OpposeRollService from "@services/OpposeRollService.js";

export function configureQueries() {
   CONFIG.queries ??= {};

   // Defender-side: register the contest on that client.
   CONFIG.queries["sr3e.opposeRollPrompt"] = async ({ contestId, initiatorId, targetId, rollData, options }) => {
      console.log("[sr3e] Received opposeRollPrompt query", { contestId, initiatorId, targetId });

      const initiator = game.actors.get(initiatorId);
      const target = game.actors.get(targetId);
      if (!initiator || !target) {
         console.warn("[sr3e] Could not resolve actors for opposeRollPrompt");
         return { acknowledged: false };
      }

      OpposeRollService.registerContest({ contestId, initiator, target, rollData, options });

      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === contestId);
      if (msg) msg.render(true);

      return { acknowledged: true };
   };

   // Back to initiator: resolve target roll and continue the chain.
   CONFIG.queries["sr3e.resolveOpposedRoll"] = async ({ contestId, rollData }) => {
      await OpposeRollService.resolveTargetRoll(contestId, rollData);
      return { ok: true };
   };

   // Optional relay.
   CONFIG.queries["sr3e.resolveOpposedRollRemote"] = async ({ contestId, rollData, initiatorId }) => {
      console.log(`[sr3e] Received resolveOpposedRollRemote on ${game.user.name}`, { contestId });
      return CONFIG.queries["sr3e.resolveOpposedRoll"]({ contestId, rollData });
   };

   // Resolve opposed roll with NO Dodge (treat as 0 successes) routed through the initiator
   CONFIG.queries["sr3e.resolveOpposedNoDodge"] = async ({ contestId }) => {
      const contest = OpposeRollService.getContestById(contestId);
      if (!contest) throw new Error(`sr3e: contest ${contestId} not found`);

      // A 0-success "roll"
      const noDodgeRollData = {
         terms: [{ results: [] }],
         options: { targetNumber: 4 },
      };

      const initiatorUser = OpposeRollService.resolveControllingUser(contest.initiator);

      // Run the resolution on the initiator's side (author/owner of the original chat msg)
      if (initiatorUser?.id === game.user.id) {
         await CONFIG.queries["sr3e.resolveOpposedRoll"]({ contestId, rollData: noDodgeRollData });
      } else {
         await initiatorUser.query("sr3e.resolveOpposedRollRemote", {
            contestId,
            rollData: noDodgeRollData,
            initiatorId: initiatorUser?.id,
         });
      }

      return { ok: true };
   };

   CONFIG.queries["sr3e.markOpposedResponded"] = async ({ messageId }) => {
      const msg = game.messages.get(messageId);
      if (!msg) throw new Error(`sr3e: chat message ${messageId} not found`);

      // Only allow GM or the message author to update
      if (!(game.user.isGM || msg.isAuthor))
         throw new Error("sr3e: insufficient permission to update ChatMessage");

      await msg.update({
         flags: {
            ...msg.flags,
            sr3e: { ...(msg.flags?.sr3e || {}), opposedResponded: true },
         },
      });
      return { ok: true };
   };

   // Abort flow.
   CONFIG.queries["sr3e.abortOpposedRoll"] = async ({ contestId }) => {
      console.warn(`[sr3e] Received abortOpposedRoll for ${contestId}`);
      const contest = OpposeRollService.getContestById(contestId);
      if (!contest) return;
      OpposeRollService.abortOpposedRoll(contestId);
      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === contestId);
      if (msg) msg.render(true);
   };

   CONFIG.queries["sr3e.resolveResistanceRoll"] = async ({ defenderId, weaponId, prep, rollData }) => {
      await OpposeRollService.resolveDamageResistanceFromRoll({ defenderId, weaponId, prep, rollData });
      return { ok: true };
   };
}
