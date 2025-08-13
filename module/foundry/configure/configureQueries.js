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
