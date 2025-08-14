import OpposeRollService from "@services/OpposeRollService.js";
import { localize } from "@services/utilities";

export async function addOpposedResponseButton(message, html, data) {
   DEBUG && LOG.inspect("Hook", [__FILE__, __LINE__, addOpposedResponseButton.name], { message, html, data });

   const contestId = message.flags?.sr3e?.opposed;
   const config = CONFIG.sr3e;
   if (!contestId) return;

   const container = html.querySelector(".sr3e-response-button-container");
   if (!container) return;

   const contest = OpposeRollService.getContestById(contestId);

   // Build a stable UI container to avoid duplicate inserts on re-render.
   let ui = container.querySelector(".sr3e-dodge-ui");
   if (ui) ui.remove(); // re-render → rebuild
   ui = document.createElement("div");
   ui.classList.add("sr3e-dodge-ui");
   container.appendChild(ui);

   if (!contest) {
      const expired = document.createElement("button");
      expired.classList.add("sr3e-response-button", "expired");
      expired.disabled = true;
      expired.title = localize(config.chat.contestexpried);
      expired.innerText = localize(config.chat.contestexpried);
      ui.appendChild(expired);
      return;
   }

   const actor = contest.target;
   const controllingUser = OpposeRollService.resolveControllingUser(actor);
   const isControllingUser = game.user.id === controllingUser?.id;
   const alreadyResponded = contest.targetRoll !== null || message.flags?.sr3e?.opposedResponded;

   if (!isControllingUser || alreadyResponded) return;

   // Layout: "Dodge" on its own line, followed by buttons on the next line
   const prompt = document.createElement("div");
   prompt.classList.add("sr3e-dodge-prompt");
   prompt.innerText = "Dodge";

   // Build wrapper for buttons
   const wrapper = document.createElement("div");
   wrapper.classList.add("buttons-horizontal-distribution");
   wrapper.setAttribute("role", "group");
   wrapper.setAttribute("aria-label", "Dodge choice");

   // Build buttons
   const yesBtn = document.createElement("button");
   yesBtn.classList.add("sr3e-response-button", "yes");
   yesBtn.dataset.contestId = contestId;
   yesBtn.innerText = "Yes";

   const noBtn = document.createElement("button");
   noBtn.classList.add("sr3e-response-button", "no");
   noBtn.dataset.contestId = contestId;
   noBtn.innerText = "No";

   // Append buttons into wrapper and then wrapper after prompt
   wrapper.append(yesBtn, noBtn);
   ui.append(prompt, wrapper);

   // --- YES: open Respond flow (your existing behavior) ---
   yesBtn.onclick = async () => {
      console.log(`[sr3e] Dodge=YES clicked by ${game.user.name} for contest ${contestId}`);

      const current = OpposeRollService.getContestById(contestId);
      if (!current) {
         yesBtn.disabled = true;
         noBtn.disabled = true;
         yesBtn.classList.add("expired");
         yesBtn.innerText = localize(config.chat.contestexpried);
         yesBtn.title = localize(config.chat.contestexpried);
         return;
      }

      yesBtn.disabled = true;
      noBtn.disabled = true;
      yesBtn.classList.add("responded");

      const actorSheet = current.target.sheet;
      if (!actorSheet.rendered) await actorSheet.render(true);

      const caller = {
         type: "dodge",
         key: "dodge",
         name: localize(config.dodge.dodge),
         dice: 0, // start with zero dice
         value: 0,
         responseMode: true, // Composer: response flow
         contestId,
      };

      actorSheet.setRollComposerData(caller);

      const rollData = await OpposeRollService.waitForResponse(contestId);

      await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({
         contestId,
         rollData,
         initiatorId: current.initiator.id,
      });

      // Mark message so we do not offer buttons again on re-render
      try {
         await message.update({ flags: { sr3e: { opposedResponded: true } } });
      } catch (e) {
         console.warn("[sr3e] Unable to set opposedResponded flag:", e);
      }
   };

   // --- NO: skip Dodge (0 successes) and continue immediately ---
   noBtn.onclick = async () => {
      console.log(`[sr3e] Dodge=NO clicked by ${game.user.name} for contest ${contestId}`);

      const current = OpposeRollService.getContestById(contestId);
      if (!current) {
         yesBtn.disabled = true;
         noBtn.disabled = true;
         noBtn.classList.add("expired");
         noBtn.innerText = localize(config.chat.contestexpried);
         noBtn.title = localize(config.chat.contestexpried);
         return;
      }

      yesBtn.disabled = true;
      noBtn.disabled = true;
      noBtn.classList.add("responded");

      // Empty rollData → getSuccessCount = 0 for defender
      await CONFIG.queries["sr3e.resolveOpposedNoDodgeRemote"]({
         contestId,
         initiatorId: current.initiator.id,
      });

      // Mark message so we do not offer buttons again on re-render
      try {
         await message.update({ flags: { sr3e: { opposedResponded: true } } });
      } catch (e) {
         console.warn("[sr3e] Unable to set opposedResponded flag:", e);
      }
   };

}
