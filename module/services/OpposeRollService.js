import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
import { mount, unmount } from "svelte";

const activeContests = new Map();

export default class OpposeRollService {
   static getContestById(id) {
      return activeContests.get(id);
   }
   static async start({ initiator, target, rollData, isSilent = false }) {
      const existing = [...activeContests.values()].find(
         (c) => c.initiator.id === initiator.id && c.target.id === target.id && !c.isResolved
      );
      if (existing) return;

      const contestId = foundry.utils.randomID(16);

      activeContests.set(contestId, {
         id: contestId,
         initiator,
         target,
         initiatorRoll: rollData,
         targetRoll: null,
         isResolved: false,
      });

      // Determine target user(s), excluding GMs
      const targetUsers = game.users.filter(
         (u) =>
            !u.isGM &&
            u.active &&
            (u.character?.id === target.id || target.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
      );

      const targetUser = targetUsers[0];

      if (targetUser && game.user.id === targetUser.id) {
         await this.promptTargetRoll(contestId, initiator, target);
      } else if (targetUser) {
         game.socket.emit("system.sr3e", {
            action: "opposeRoll",
            data: {
               contestId,
               initiatorId: initiator.id,
               targetId: target.id,
               rollData,
               targetUserId: targetUser.id,
            },
         });
      }

      const defenderIds = targetUsers.map((u) => u.id);
      const whisperIds = [initiator?.user?.id, ...defenderIds].filter(Boolean);

      if (game.user.isGM || game.user.id === initiator?.user?.id) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: initiator }),
            whisper: whisperIds,
            content: `<p>${initiator.name} has initiated an opposed roll against ${target.name}.</p>`,
            flags: { "sr3e.opposed": contestId },
         });
      }
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
