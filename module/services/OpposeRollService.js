import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
import { mount, unmount } from "svelte";

const activeContests = new Map();

export default class OpposeRollService {
   static async start({ initiator, target, rollData, isSilent = false }) {
      const contestId = foundry.utils.randomID(16);

      if (activeContests.has(contestId)) return;

      activeContests.set(contestId, {
         id: contestId,
         initiator,
         target,
         initiatorRoll: rollData,
         targetRoll: null,
         isResolved: false,
      });

      const targetUser = game.users.find(
         (u) => u.active && (u.character?.id === target.id || target.testUserPermission(u, "OWNER"))
      );

      if (!targetUser) {
         console.warn(`No active user found for target actor "${target.name}"`);
         return;
      }

      if (targetUser.id === game.user.id) {
         // Target is on this client
         await OpposeRollService.promptTargetRoll(contestId, initiator, target);
      } else {
         // Send socket request
         game.socket.emit("system.sr3e", {
            action: "requestOpposedRoll",
            payload: {
               contestId,
               initiatorUuid: initiator.uuid,
               targetUuid: target.uuid,
               prompt: `You are being opposed by ${initiator.name}. Select any roll to respond.`,
            },
         });
      }

      if (!isSilent) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: initiator }),
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