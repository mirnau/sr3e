import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
import { mount, unmount } from "svelte";

const activeContests = new Map();

export default class OpposeRollService {
   static async start({ initiator, target, rollData, isSilent = false }) {
      // Prevent duplicate contests for the same actor pair
      const existing = [...activeContests.values()].find(c =>
         c.initiator.id === initiator.id && c.target.id === target.id && !c.isResolved
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

      const targetUser = game.users.find(u =>
         u.active && (u.character?.id === target.id || target.testUserPermission(u, "OWNER"))
      );

      if (!targetUser) {
         console.warn(`No active user found for target actor "${target.name}"`);
         return;
      }

      // Only render prompt on the defender's session
      if (game.user.id === targetUser.id) {
         await this.promptTargetRoll(contestId, initiator, target);
      } else {
         game.socket.emit("system.sr3e", {
            action: "opposeRoll",
            data: {
               contestId,
               initiatorId: initiator.id,
               targetId: target.id,
               rollData,
            }
         });
      }

      // Only initiator (or GM) posts the message
      if (game.user.isGM || game.user.id === initiator?.user?.id) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: initiator }),
            whisper: [initiator?.user?.id, targetUser.id].filter(Boolean),
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

   static async promptTargetRoll(contestId, initiator, target) {
      new Dialog({
         title: game.i18n.localize("sr3e.opposedRoll.title") ?? "Opposed Roll Incoming",
         content: `
            <p>${initiator.name} is initiating an opposed roll against you.</p>
            <p>Please respond by clicking a skill, attribute, or item in your character sheet.</p>
            <p>This dialog will close automatically when you roll.</p>
         `,
         buttons: {},
         close: () => {},
         default: null
      }, {
         id: `sr3e-opposed-roll-${contestId}`,
         classes: ["sr3e", "opposed-roll-dialog"],
         resizable: false,
         width: 400
      }).render(true);
   }
}