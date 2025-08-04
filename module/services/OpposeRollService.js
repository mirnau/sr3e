const activeContests = new Map();
const pendingResponses = new Map();

export default class OpposeRollService {
   static getContestById(id) {
      return activeContests.get(id);

      
   }

      static waitForResponse(contestId) {
      return new Promise((resolve) => {
         pendingResponses.set(contestId, resolve);
      });
   }

   static deliverResponse(contestId, rollData) {
      const resolver = pendingResponses.get(contestId);
      if (resolver) {
         resolver(rollData);
         pendingResponses.delete(contestId);
      }
   }

   static getContestForTarget(target) {
      return [...activeContests.values()].find((c) => c.target.id === target.id && !c.isResolved);
   }

   static registerContest({ contestId, initiator, target, rollData, options }) {
      activeContests.set(contestId, {
         id: contestId,
         initiator,
         target,
         initiatorRoll: rollData,
         targetRoll: null,
         options,
         isResolved: false,
      });
      console.log("[sr3e] Contest registered:", contestId);
   }

   static async start({ initiator, target, rollData, options }) {
      const contestId = foundry.utils.randomID(16);

      // Register locally first
      this.registerContest({ contestId, initiator, target, rollData, options });


      // Send query to target user
      const targetUser = this.resolveControllingUser(target);
      if (!targetUser) {
         console.warn("[sr3e] No controlling user for target", target.name);
         return;
      }

      try {
         await targetUser.query("sr3e.opposeRollPrompt", {
            contestId,
            initiatorId: initiator.id,
            targetId: target.id,
            rollData,
            options: options,
         });
      } catch (err) {
         console.warn("[sr3e] Target user did not respond to opposeRollPrompt:", err);
         // Optional: clean up
         return;
      }

      // Proceed with chat message
      const initiatorUser = this.resolveControllingUser(initiator);
      const whisperIds = [initiatorUser?.id, targetUser?.id].filter(Boolean);

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: initiator }),
         whisper: whisperIds,
         content: `
         <p><strong>${initiator.name}</strong> has initiated an opposed roll against <strong>${target.name}</strong>.</p>
         <div class="sr3e-response-button-container" data-contest-id="${contestId}"></div>
      `,
         flags: { "sr3e.opposed": contestId },
      });

      return contestId;
   }

   static resolveControllingUser(actor) {
      const connectedUsers = game.users.filter((u) => u.active);

      // 1. If character is assigned and user is online
      const assignedUser = connectedUsers.find((u) => u.character?.id === actor?.id);
      if (assignedUser) return assignedUser;

      // 2. If any *non-GM* connected user has OWNER permission
      const playerOwner = connectedUsers.find(
         (u) => !u.isGM && actor?.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
      );
      if (playerOwner) return playerOwner;

      // 3. Fallback to any connected GM
      const gmUser = connectedUsers.find((u) => u.isGM);
      return gmUser;
   }

   static async abortOpposedRoll(contestId) {
      //TODO
   }

   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      if (!contest) return;

      contest.targetRoll = rollData;
      contest.isResolved = true;

      const netSuccesses = computeNetSuccesses(contest.initiatorRoll, contest.targetRoll);
      const winner = netSuccesses > 0 ? contest.initiator : contest.target;

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: winner }),
         content: `<p>${contest.initiator.name} attacks ${contest.target.name}.<br>
            ${contest.target.name} responds.<br>
            ${winner.name} wins the opposed roll (${Math.abs(netSuccesses)} net successes).</p>`,
         flags: { "sr3e.opposedResolved": true },
      });

      const dialogId = `sr3e-opposed-roll-${contestId}`;
      ui.windows[dialogId]?.close();

      activeContests.delete(contestId);
   }
}
