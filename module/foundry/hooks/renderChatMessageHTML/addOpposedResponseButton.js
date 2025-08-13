import OpposeRollService from "@services/OpposeRollService.js";

export async function addOpposedResponseButton(message, html, data) {
   const contestId = message.flags?.sr3e?.opposed;
   if (!contestId) return;

   const container = html.querySelector(".sr3e-response-button-container");
   if (!container) return;

   const btn = document.createElement("button");
   btn.classList.add("sr3e-response-button");
   btn.dataset.contestId = contestId;
   btn.innerText = game.i18n.localize("sr3e.chat.respond");

   const contest = OpposeRollService.getContestById(contestId);

   if (!contest) {
      btn.disabled = true;
      btn.title = game.i18n.localize("sr3e.chat.contestExpired");
      btn.classList.add("expired");
      container.appendChild(btn);
      return;
   }

   const actor = contest.target;
   const controllingUser = OpposeRollService.resolveControllingUser(actor);
   const isControllingUser = game.user.id === controllingUser?.id;
   const alreadyResponded = contest.targetRoll !== null || message.flags?.sr3e?.opposedResponded;

   if (!isControllingUser || alreadyResponded) return;

   btn.onclick = async () => {
      console.log(`[sr3e] Respond button clicked by ${game.user.name} for contest ${contestId}`);

      const contest = OpposeRollService.getContestById(contestId);

      if (!contest) {
         btn.disabled = true;
         btn.classList.add("expired");
         btn.innerText = game.i18n.localize("sr3e.chat.contestExpired");
         btn.title = game.i18n.localize("sr3e.chat.contestExpired");
         return;
      }

      btn.disabled = true;
      btn.classList.add("responded");
      btn.innerText = game.i18n.localize("sr3e.chat.responded");

      const actorSheet = contest.target.sheet;
      if (!actorSheet.rendered) await actorSheet.render(true);

      const caller = {
         key: contest.options.attributeName,
         type: contest.options.type,
         dice: 0,
         value: 0,
         responseMode: true,
         contestId,
      };

      actorSheet.setRollComposerData(caller);

      const rollData = await OpposeRollService.waitForResponse(contestId);

      await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({
         contestId,
         rollData,
         initiatorId: contest.initiator.id,
      });
   };

   container.appendChild(btn);
}
