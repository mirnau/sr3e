import OpposeRollService from "@services/OpposeRollService.js";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";

export async function addOpposedResponseButton(message, html /*, data */) {
  const contestId = message.flags?.sr3e?.opposed;
  if (!contestId) return;

  const container = html.querySelector(".sr3e-response-button-container");
  if (!container) return;

  const contest = OpposeRollService.getContestById(contestId);

  // Stable UI holder (avoid shadowing Foundry's global `ui`)
  let uiHost = container.querySelector(".sr3e-responder-ui");
  if (uiHost) uiHost.remove();
  uiHost = document.createElement("div");
  uiHost.classList.add("sr3e-responder-ui");
  container.appendChild(uiHost);

  if (!contest) {
    const b = document.createElement("button");
    b.classList.add("sr3e-response-button", "expired");
    b.disabled = true;
    b.title = "Contest expired";
    b.innerText = "Contest expired";
    uiHost.appendChild(b);
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
    uiHost.appendChild(err);
    return;
  }

  let initiatorProc;
  try {
    initiatorProc = await AbstractProcedure.fromJSON(procJSON);
  } catch (e) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = `Failed to rehydrate initiator procedure: ${e?.message || e}`;
    uiHost.appendChild(err);
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
    uiHost.appendChild(err);
    return;
  }

  uiHost.innerHTML = responderHTML;

  // NEW: accept ANY [data-responder] button (yes/no/standard/full/etc.)
  const buttons = Array.from(uiHost.querySelectorAll("[data-responder]"));
  if (!buttons.length) {
    const err = document.createElement("div");
    err.classList.add("sr3e-dodge-error");
    err.innerText = "Responder UI is missing [data-responder] controls.";
    uiHost.appendChild(err);
    return;
  }

  // Helper to disable all buttons and mark one as responded
  const disableAll = (clicked) => {
    for (const b of buttons) {
      b.disabled = true;
      b.classList.toggle("responded", b === clicked);
    }
  };

  // Wire each responder button
  for (const btn of buttons) {
    btn.onclick = async () => {
      try {
        disableAll(btn);

        const current = OpposeRollService.getContestById(contestId);
        if (!current) {
          btn.classList.add("expired");
          btn.innerText = "Contest expired";
          return;
        }

        const responderKey = String(btn.dataset.responder || "").toLowerCase();

        // NO → treat as 0 successes (works for dodge-style flows)
        if (responderKey === "no") {
          await CONFIG.queries["sr3e.resolveOpposedNoDodge"]({ contestId });

          const messageId = message.id;
          const authorUser = game.messages.get(messageId)?.author;
          if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId });
          return;
        }

        // YES or any named defense kind (e.g., "standard", "full")
        const defenseProc = await initiatorProc.buildDefenseProcedure(exportCtx, {
          defender,
          contestId,
          responderKey, // <-- this is the key for melee to choose standard/full
        });

        const sheet = defender.sheet;
        if (!sheet.rendered) await sheet.render(true);
        sheet.displayRollComposer(defenseProc);

        // Wait until the defense procedure calls deliverResponse
        const rollData = await OpposeRollService.waitForResponse(contestId);

        // Resolve on the initiator's client (relayed if necessary)
        await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({
          contestId,
          rollData,
        });

        // Mark the chat message as responded so it won't re-offer buttons
        const messageId = message.id;
        const authorUser = game.messages.get(messageId)?.author;
        if (authorUser) authorUser.query("sr3e.markOpposedResponded", { messageId });
      } catch (e) {
        // Use Foundry's global UI, not the local DOM element
        ui.notifications?.error?.(e?.message || "Defense flow failed");
        console.error(e);
      }
    };
  }
}
