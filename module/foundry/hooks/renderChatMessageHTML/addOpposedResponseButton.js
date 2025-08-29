// services/procedure/ui/addOpposedResponseButton.js
import OpposeRollService from "@services/OpposeRollService.js";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import { localize } from "@services/utilities.js";

function RuntimeConfig() {
   return CONFIG?.sr3e || {};
}

export async function addOpposedResponseButton(message, html /*, data */) {
   const contestId = message?.flags?.sr3e?.opposed;
   if (!contestId) return;

   const container = html.querySelector(".sr3e-response-button-container");
   if (!container) return;

   let uiHost = container.querySelector(".sr3e-responder-ui");
   if (uiHost) uiHost.remove();
   uiHost = document.createElement("div");
   uiHost.classList.add("sr3e-responder-ui");
   container.appendChild(uiHost);

   const contest = OpposeRollService.getContestById(contestId);
   if (!contest || !contest.procedure) {
      const b = document.createElement("button");
      b.classList.add("sr3e-response-button", "expired");
      b.disabled = true;
      const txt = localize(RuntimeConfig().procedure.contestexpired);
      b.title = txt;
      b.innerText = txt;
      uiHost.appendChild(b);
      return;
   }

   const defender =
      contest.target instanceof Actor ? contest.target : game.actors.get(contest.target?.id ?? contest.target?.actorId);
   if (!defender) return;

   const controllingUser = OpposeRollService.resolveControllingUser(defender);
   const isControllingUser = game.user.id === controllingUser?.id;
   const alreadyResponded = Boolean(contest.targetRoll) || Boolean(message.flags?.sr3e?.opposedResponded);
   const isInitiatorUser = game.user.id === contest?.initiator?.userId;
   const canCancel = isInitiatorUser || game.user.isGM;
   const canRespond = isControllingUser && !alreadyResponded;
   if (!canRespond && !canCancel) return;

   const procJSON = contest.procedure.json;
   const exportCtx = contest.procedure.export;

   let initiatorProc = null;
   try {
      initiatorProc = await AbstractProcedure.fromJSON(procJSON);
   } catch (e) {
      const err = document.createElement("div");
      err.classList.add("sr3e-dodge-error");
      err.innerText = `Failed to rehydrate initiator procedure: ${e?.message || e}`;
      uiHost.appendChild(err);
      return;
   }

   let responderHTML = "";
   try {
      responderHTML = await initiatorProc.getResponderPromptHTML(exportCtx, { contest });
   } catch (e) {
      const err = document.createElement("div");
      err.classList.add("sr3e-dodge-error");
      err.innerText = `Responder UI error: ${e?.message || e}`;
      uiHost.appendChild(err);
      return;
   }

   if (canCancel && !alreadyResponded) {
      const cancel = document.createElement("button");
      cancel.classList.add("sr3e-response-button", "cancel");
      cancel.dataset.responder = "cancel";
      cancel.innerText = localize(RuntimeConfig().procedure?.cancel);
      cancel.onclick = async () => {
         cancel.disabled = true;
         try {
            await CONFIG.queries["sr3e.cancelOpposedContest"]?.({ contestId, reason: "user-cancel" });
            const authorUser = game.messages.get(message.id)?.author;
            if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId: message.id });
         } catch (e) {
            ui.notifications?.error?.(e?.message || "Cancel failed");
         }
      };
      uiHost.appendChild(cancel);
   }

   if (!canRespond) return;

   uiHost.innerHTML = responderHTML;

   const buttons = Array.from(uiHost.querySelectorAll("[data-responder]"));
   if (!buttons.length) {
      const err = document.createElement("div");
      err.classList.add("sr3e-dodge-error");
      err.innerText = "Responder UI is missing [data-responder] controls.";
      uiHost.appendChild(err);
      return;
   }

   const disableAll = (clicked) => {
      for (const b of buttons) {
         b.disabled = true;
         b.classList.toggle("responded", b === clicked);
      }
   };

   for (const btn of buttons) {
      btn.onclick = async () => {
         try {
            disableAll(btn);

            const current = OpposeRollService.getContestById(contestId);
            if (!current) {
               btn.classList.add("expired");
               btn.innerText = localize(RuntimeConfig().procedure?.contestexpired);
               return;
            }

            const responderKey = String(btn.dataset.responder || "").toLowerCase();

            if (responderKey === "no") {
               await CONFIG.queries["sr3e.resolveOpposedNoDodge"]({ contestId });
               const authorUser = game.messages.get(message.id)?.author;
               if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId: message.id });
               return;
            }

            const defenseProc = await initiatorProc.buildDefenseProcedure(exportCtx, {
               defender,
               contestId,
               responderKey,
               defenseHint: contest.defenseHint,
            });

            const sheet = defender.sheet;
            if (!sheet.rendered) await sheet.render(true);
            sheet.displayRollComposer(defenseProc);

            const rollData = await OpposeRollService.waitForResponse(contestId);
            if (!rollData || rollData.__aborted) {
               const authorUser = game.messages.get(message.id)?.author;
               if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId: message.id });
               return;
            }

            await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({ contestId, rollData });

            const authorUser = game.messages.get(message.id)?.author;
            if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId: message.id });
         } catch (e) {
            ui.notifications?.error?.(e?.message || "Defense flow failed");
            console.error(e);
         }
      };
   }
}
