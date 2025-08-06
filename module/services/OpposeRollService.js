export default class OpposeRollService {
   static #getMessage(contestId) {
      return game.messages.find((m) => m.flags?.sr3e?.opposed?.contestId === contestId);
   }

   static getContestById(contestId) {
      const msg = this.#getMessage(contestId);
      if (!msg) return null;
      const data = msg.flags.sr3e.opposed;
      return {
         id: data.contestId,
         initiator: game.actors.get(data.initiatorId),
         target: game.actors.get(data.targetId),
         initiatorRoll: data.initiatorRoll,
         targetRoll: data.targetRoll ?? null,
         options: data.options ?? {},
         resolved: data.resolved ?? false,
         pending: data.pending ?? false,
         aborted: data.aborted ?? false,
         message: msg,
      };
   }

   static getContestForTarget(target) {
      const msg = game.messages.find((m) => {
         const data = m.flags?.sr3e?.opposed;
         return data && data.targetId === target.id && !data.resolved && data.pending;
      });
      if (!msg) return null;
      return this.getContestById(msg.flags.sr3e.opposed.contestId);
   }

   static async start({ initiator, target, rollData, options }) {
      const contestId = foundry.utils.randomID(16);
      const initiatorUser = this.resolveControllingUser(initiator);
      const targetUser = this.resolveControllingUser(target);
      const whisperIds = [initiatorUser.id, targetUser.id];

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: initiator }),
         whisper: whisperIds,
         content: `
         <p><strong>${initiator.name}</strong> has initiated an opposed roll against <strong>${target.name}</strong>.</p>
         <div class="sr3e-response-button-container" data-contest-id="${contestId}"></div>
      `,
         flags: {
            sr3e: {
               opposed: {
                  contestId,
                  initiatorId: initiator.id,
                  targetId: target.id,
                  initiatorRoll: rollData,
                  targetRoll: null,
                  options,
                  resolved: false,
                  pending: true,
               },
            },
         },
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
      const msg = this.#getMessage(contestId);
      if (!msg) return;

      const data = foundry.utils.duplicate(msg.flags.sr3e.opposed);
      data.targetRoll = rollData;
      data.resolved = true;
      data.pending = false;

      const initiator = game.actors.get(data.initiatorId);
      const target = game.actors.get(data.targetId);
      const initiatorRoll = data.initiatorRoll;
      const targetRoll = rollData;
      const netSuccesses = OpposeRollService.computeNetSuccesses(initiatorRoll, targetRoll);
      const winner = netSuccesses > 0 ? initiator : target;

      const content = this.#buildContestMessage({
         initiator,
         target,
         initiatorRoll,
         targetRoll,
         winner,
         netSuccesses,
      });

      await msg.update({
         content,
         [`flags.sr3e.opposed`]: data,
      });
   }

   static async abortOpposedRoll(contestId) {
      const msg = this.#getMessage(contestId);
      if (!msg) return;
      const data = foundry.utils.duplicate(msg.flags.sr3e.opposed);
      data.pending = false;
      data.resolved = false;
      data.aborted = true;

      const initiator = game.actors.get(data.initiatorId);
      const target = game.actors.get(data.targetId);
      const content = `<p><strong>${initiator.name}</strong>'s opposed roll against <strong>${target.name}</strong> was aborted.</p>`;

      await msg.update({
         content,
         [`flags.sr3e.opposed`]: data,
      });
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

