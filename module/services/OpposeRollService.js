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

   static expireContest(contestId) {
      const contest = activeContests.get(contestId);
      if (contest) {
         activeContests.delete(contestId);
         console.log("[sr3e] Abort deleted successfully.");
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
      console.log("rollData", rollData);

      const contest = activeContests.get(contestId);
      contest.targetRoll = rollData;
      contest.isResolved = true;

      const { initiator, target, initiatorRoll, targetRoll } = contest;
      const netSuccesses = OpposeRollService.computeNetSuccesses(initiatorRoll, targetRoll);
      const winner = netSuccesses > 0 ? initiator : target;
      const speaker = initiator;
      const rollMode = game.settings.get("core", "rollMode");

      const initiatorUser = this.resolveControllingUser(initiator);
      const targetUser = this.resolveControllingUser(target);

      const content = this.#buildContestMessage({ initiator, target, initiatorRoll, targetRoll, winner, netSuccesses });
      const chatData = this.#prepareChatData({ speaker, initiatorUser, targetUser, content, rollMode });

      await ChatMessage.create(chatData);

      const dialogId = `sr3e-opposed-roll-${contestId}`;
      ui.windows[dialogId]?.close();

      activeContests.delete(contestId);
   }

   static #buildContestMessage({ initiator, target, initiatorRoll, targetRoll, winner, netSuccesses }) {
      return `
      <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
      <h4>${initiator.name}</h4>
      ${this.#buildDiceHTML(initiator, initiatorRoll)}
      <h4>${target.name}</h4>
      ${this.#buildDiceHTML(target, targetRoll)}
      <p><strong>${winner.name}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
   `;
   }

   static #prepareChatData({ speaker, initiatorUser, targetUser, content, rollMode }) {
      const chatData = {
         speaker: ChatMessage.getSpeaker({ actor: speaker }),
         user: initiatorUser?.id ?? game.user.id,
         content,
         flags: { "sr3e.opposedResolved": true },
      };

      switch (rollMode) {
         case "gmroll":
            chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
            break;
         case "blindroll":
            chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
            chatData.blind = true;
            break;
         case "selfroll":
            chatData.whisper = [initiatorUser.id, targetUser.id];
            break;
         case "public":
         default:
            break;
      }

      return chatData;
   }

   static #buildDiceHTML(actor, rollData) {
      const term = rollData.terms?.[0];
      const results = term?.results ?? [];
      const tn = rollData?.options?.targetNumber ?? "?";
      const successes = results.filter((r) => r.result >= tn && !r.discarded).length;

      const skill = rollData.options.skillName;
      const specialization = rollData.options.specializationName;
      const attribute = rollData.options.attributeName;
      const formula = rollData.formula ?? `${term?.number ?? "?"}d6x${tn}`;

      let description = skill
         ? specialization
            ? `${skill} (${specialization})`
            : skill
         : attribute
         ? game.i18n.localize(`sr3e.attributes.${attribute}`)
         : "Unspecified roll";

      return `
      <div class="dice-roll expanded">
         <div class="dice-result">
            <div class="dice-context">
               <em>${description} vs TN ${tn} using ${formula}</em>
            </div>
            <div class="dice-formula">${formula}</div>
            <div class="dice-tooltip">
               <div class="wrapper">
                  <section class="tooltip-part">
                     <div class="dice">
                        <header class="part-header flexrow">
                           <span class="part-formula">${term?.number ?? "?"}d6x${tn}</span>
                           <span class="part-total">${successes} successes (TN: ${tn})</span>
                        </header>
                        <ol class="dice-rolls">
                           ${results
                              .map((d) => {
                                 const cls = ["roll", "_sr3edie", "d6"];
                                 if (d.result === 6) cls.push("max");
                                 if (d.result >= tn) cls.push("success");
                                 return `<li class="${cls.join(" ")}">${d.result}</li>`;
                              })
                              .join("")}
                        </ol>
                     </div>
                  </section>
               </div>
            </div>
            <h4 class="dice-total">${successes} successes (TN: ${tn})</h4>
         </div>
      </div>`;
   }

   static computeNetSuccesses(initiatorRollData, targetRollData) {
      const initiatorSuccesses = this.getSuccessCount(initiatorRollData);
      const targetSuccesses = this.getSuccessCount(targetRollData);
      return initiatorSuccesses - targetSuccesses;
   }

   static getSuccessCount(rollData) {
      const term = rollData.terms[0];
      const tn = rollData.options?.targetNumber;

      if (!tn || !term?.results) return 0;

      return term.results.filter((r) => r.active && r.result >= tn).length;
   }
}
