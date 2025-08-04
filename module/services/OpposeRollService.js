const activeContests = new Map();

export default class OpposeRollService {
   static getContestById(id) {
      return activeContests.get(id);
   }

   static getContestForTarget(target) {
      return [...activeContests.values()].find((c) => c.target.id === target.id && !c.isResolved);
   }

   static registerContest({ contestId, initiator, target, rollData }) {
      activeContests.set(contestId, {
         id: contestId,
         initiator,
         target,
         initiatorRoll: rollData,
         targetRoll: null,
         isResolved: false,
      });
      console.log("[sr3e] Contest registered:", contestId);
   }

   static onSocketRegisterContest({ contestId, initiatorId, targetId, rollData }) {
      const initiator = game.actors.get(initiatorId);
      const target = game.actors.get(targetId);

      if (!initiator || !target) {
         console.warn("[sr3e] Could not resolve actors for synced contest:", { initiatorId, targetId });
         return;
      }

      this.registerContest({ contestId, initiator, target, rollData });

      // Re-render the related chat message
      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === contestId);
      if (msg) msg.render(true);
   }

   static async start({ initiator, target, rollData }) {
      for (const [id, contest] of activeContests.entries()) {
         if (contest.initiator.id === initiator.id && contest.target.id === target.id && !contest.isResolved) {
            activeContests.delete(id);
         }
      }

      const contestId = foundry.utils.randomID(16);
      game.socket.emit("system.sr3e", {
         action: "register",
         data: {
            contestId,
            initiatorId: initiator.id,
            targetId: target.id,
            rollData,
         },
      });

      OpposeRollService.registerContest({ contestId, initiator, target, rollData });

      const initiatorUser = this.resolveControllingUser(initiator);
      const targetUser = this.resolveControllingUser(target);
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
