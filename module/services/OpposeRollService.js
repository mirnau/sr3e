const activeContests = new Map();

export default class OpposeRollService {
   static getContestById(id) {
      return activeContests.get(id);
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
      console.log("[sr3e] Contest map now contains:", [...activeContests.keys()]);
   }

   static async start({ initiator, target, rollData }) {
      // Remove existing unresolved contest between the same pair
      for (const [id, contest] of activeContests.entries()) {
         if (contest.initiator.id === initiator.id && contest.target.id === target.id && !contest.isResolved) {
            activeContests.delete(id);
         }
      }

      const contestId = foundry.utils.randomID(16);
      this.registerContest({ contestId, initiator, target, rollData });

      // Emit to all clients — receiving end filters for actor ownership
      game.socket.emit("system.sr3e", {
         action: "opposeRoll",
         data: {
            contestId,
            initiatorId: initiator.id,
            targetId: target.id, // Actor-based targeting
            rollData,
         },
      });

      // Whisper to GM and initiator only — the rest is handled client-side via socket filters

      const initiatorUser = OpposeRollService.resolveControllingUser(initiator);
      const targetUser = OpposeRollService.resolveControllingUser(target);

      const whisperIds = [initiatorUser?.id, targetUser?.id].filter(Boolean);

      if (whisperIds.includes(game.user.id)) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: initiator }),
            whisper: whisperIds,
            content: `
         <p><strong>${initiator.name}</strong> has initiated an opposed roll against <strong>${
               target.name
            }</strong>.</p>
         <button class="sr3e-response-button" data-contest-id="${contestId}">
            ${game.i18n.localize("sr3e.chat.respond")}
         </button>`,
            flags: { "sr3e.opposed": contestId },
         });
      }

      return contestId;
   }

   static resolveControllingUser(actor) {
      return (
         actor.user ??
         game.users.find((u) => actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) ??
         game.users.find((u) => u.isGM)
      );
   }

   static async abortOpposedRoll(contestId) {
      const contest = activeContests.get(contestId);
      if (!contest) return;

      const { initiator, target } = contest;

      // Optionally: notify target user(s) via socket
      const targetUsers = game.users.filter(
         (u) =>
            !u.isGM &&
            u.active &&
            (u.character?.id === target.id || target.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
      );

      const whisperIds = [initiator?.user?.id, ...targetUsers.map((u) => u.id)].filter(Boolean);

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: initiator }),
         whisper: whisperIds,
         content: `<p>${initiator.name} has aborted the opposed roll against ${target.name}.</p>`,
         flags: { "sr3e.opposedAborted": true },
      });

      // Close any open dialog
      const dialogId = `sr3e-opposed-roll-${contestId}`;
      ui.windows[dialogId]?.close();

      activeContests.delete(contestId);
   }

   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      if (!contest) throw new Error(`No contest found for ID ${contestId}`);

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

   static getContestForTarget(target) {
      return [...activeContests.values()].find((c) => c.target.id === target.id && !c.isResolved);
   }
}
