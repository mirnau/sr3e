// module/hooks/addOpposedResponseButton.js
import OpposeRollService from "@services/OpposeRollService.js";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";

export async function addOpposedResponseButton(message, html /*, data */) {
  const contestId = message.flags?.sr3e?.opposed;
  if (!contestId) return;

  const container = html.querySelector(".sr3e-response-button-container");
  if (!container) return;

  const contest = OpposeRollService.getContestById(contestId);

  // Stable UI holder
  let ui = container.querySelector(".sr3e-responder-ui");
  if (ui) ui.remove();
  ui = document.createElement("div");
  ui.classList.add("sr3e-responder-ui");
  container.appendChild(ui);

  if (!contest) {
    const b = document.createElement("button");
    b.classList.add("sr3e-response-button", "expired");
    b.disabled = true;
    b.title = "Contest expired";
    b.innerText = "Contest expired";
    ui.appendChild(b);
    return;
  }

  // Defender doc & permissions
  const defender = contest.target instanceof Actor
    ? contest.target
    : game.actors.get(contest.target?.id ?? contest.target?.actorId);
  if (!defender) return; // not hydrated locally yet

  const controllingUser = OpposeRollService.resolveControllingUser(defender);
  const isControllingUser = game.user.id === controllingUser?.id;
  const alreadyResponded = Boolean(contest.targetRoll) || Boolean(message.flags?.sr3e?.opposedResponded);
  if (!isControllingUser || alreadyResponded) return;

  // Rehydrate the initiator’s procedure (not the defense one!)
  const procJSON = contest?.procedure?.json;
  const exportCtx = contest?.procedure?.export;
  if (!procJSON || !exportCtx) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = "Opposed flow is missing procedure payload.";
    ui.appendChild(err);
    return;
  }

  let initiatorProc;
  try {
    initiatorProc = await AbstractProcedure.fromJSON(procJSON);
  } catch (e) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = `Failed to rehydrate initiator procedure: ${e?.message || e}`;
    ui.appendChild(err);
    return;
  }

  // Ask the procedure for responder UI (HTML string)
  let responderHTML;
  try {
    responderHTML = await initiatorProc.getResponderPromptHTML(exportCtx, { contest });
  } catch (e) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = `Responder UI error: ${e?.message || e}`;
    ui.appendChild(err);
    return;
  }

  ui.innerHTML = responderHTML;

  const yesBtn = ui.querySelector('[data-responder="yes"]');
  const noBtn  = ui.querySelector('[data-responder="no"]');
  if (!yesBtn || !noBtn) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = "Responder UI is missing yes/no controls.";
    ui.appendChild(err);
    return;
  }

  // YES → build defense procedure & open composer
  yesBtn.onclick = async () => {
    try {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      yesBtn.classList.add("responded");

      const current = OpposeRollService.getContestById(contestId);
      if (!current) {
        yesBtn.classList.add("expired");
        yesBtn.innerText = "Contest expired";
        return;
      }

      const defenseProc = await initiatorProc.buildDefenseProcedure(exportCtx, {
        defender,
        contestId,
      });

      const sheet = defender.sheet;
      if (!sheet.rendered) await sheet.render(true);
      sheet.displayRollComposer(defenseProc);

      // Wait until the defense procedure calls deliverResponse
      const rollData = await OpposeRollService.waitForResponse(contestId);

      await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({
        contestId,
        rollData,
        initiatorId: current.initiatorId,
      });

      const messageId = message.id;
      const authorUser = game.messages.get(messageId)?.author;
      if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId });
    } catch (e) {
      ui.notifications?.error?.(e?.message || "Defense flow failed");
    }
  };

  // NO → treat as 0 successes
  noBtn.onclick = async () => {
    try {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      noBtn.classList.add("responded");

      await CONFIG.queries["sr3e.resolveOpposedNoDodge"]({ contestId });

      const messageId = message.id;
      const authorUser = game.messages.get(messageId)?.author;
      if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId });
    } catch (e) {
      ui.notifications?.error?.(e?.message || "Defense skip failed");
    }
  };
}