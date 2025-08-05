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
      resolver(rollData);
      pendingResponses.delete(contestId);
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
   }

   static async start({ initiator, target, rollData, options }) {
      const contestId = foundry.utils.randomID(16);
      
      this.registerContest({ contestId, initiator, target, rollData, options });

      const targetUser = this.resolveControllingUser(target);
      
      await targetUser.query("sr3e.opposeRollPrompt", {
         contestId,
         initiatorId: initiator.id,
         targetId: target.id,
         rollData,
         options: options,
      });

      const initiatorUser = this.resolveControllingUser(initiator);
      const whisperIds = [initiatorUser.id, targetUser.id];

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

      const assignedUser = connectedUsers.find((u) => u.character?.id === actor?.id);
      if (assignedUser) return assignedUser;

      const playerOwner = connectedUsers.find(
         (u) => !u.isGM && actor?.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
      );
      if (playerOwner) return playerOwner;

      return connectedUsers.find((u) => u.isGM);
   }

   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      
      contest.targetRoll = rollData;
      contest.isResolved = true;

      const netSuccesses = this.computeNetSuccesses(contest.initiatorRoll, contest.targetRoll);
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

   static computeNetSuccesses(initiatorRollData, targetRollData) {
      const initiatorSuccesses = this.getSuccessCount(initiatorRollData);
      const targetSuccesses = this.getSuccessCount(targetRollData);
      return initiatorSuccesses - targetSuccesses;
   }

   static getSuccessCount(rollData) {
      const diceTerm = rollData.terms.find((t) => t.class === "Die" && t.faces === 6);
      const targetNumber = parseInt(rollData.options.targetNumber, 10);
      return diceTerm.results.filter((r) => r.result >= targetNumber && !r.discarded).length;
   }
}