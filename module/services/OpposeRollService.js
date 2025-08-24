import FirearmService from "@families/FirearmService.js";
import MeleeService from "@families/MeleeService.js";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";

const activeContests = new Map();
const pendingResponses = new Map();

export default class OpposeRollService {
   // -----------------------
   // Bookkeeping
   // -----------------------
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
      resolver?.(rollData);
      pendingResponses.delete(contestId);
   }

   static expireContest(contestId) {
      const contest = activeContests.get(contestId);
      if (!contest) return;
      if (contest.timer) {
         clearTimeout(contest.timer);
         contest.timer = null;
      }
      activeContests.delete(contestId);
      this.deliverResponse(contestId, { __aborted: true });
   }

   static abortOpposedRoll(contestId, { reason = "user-cancel", byUserId = game.user?.id } = {}) {
      const contest = activeContests.get(contestId);
      this.expireContest(contestId);
      const mId = contest?.messageId;
      const msg = mId ? game.messages.get(mId) : null;
      if (msg) {
         const f = foundry.utils.duplicate(msg.flags || {});
         f.sr3e = { ...(f.sr3e || {}), opposedResponded: true, opposedCancelled: reason, opposedCancelledBy: byUserId };
         msg.update({ flags: f }).catch(() => {});
      }
      Hooks.callAll("sr3e:contest-cancelled", { contestId, reason, byUserId });
      return true;
   }

   /**
    * Local registration on any client that receives the stub via query.
    * The stub ONLY contains ids (no heavy docs). We resolve to Actor docs here.
    */
   static registerContestStub(stub) {
      const { contestId, initiator, target, initiatorRoll, procedure, defenseHint } = stub;

      const targetActorId = target?.actorId ?? null;
      const targetActor = targetActorId ? game.actors.get(targetActorId) : null;

      const contest = {
         id: contestId,
         initiator,
         target: targetActor,
         initiatorRoll,
         targetRoll: null,
         isResolved: false,
         procedure, // { class, json, export }
         defenseHint, // hint object for defender UI
         phase: "awaiting-response",
      };

      activeContests.set(contestId, contest);
      return contest;
   }

   // -----------------------
   // Procedure-driven start
   // -----------------------
   /**
    * Start opposed flow from the initiator’s client.
    * - Store full docs locally.
    * - Send a *stub* (ids + exports) to remote clients.
    */
   static async startProcedure({ procedure, targetActor, targetToken = null, roll }) {
      const initiator = procedure?.caller;
      const contestId = foundry.utils.randomID(16);

      const initiatorRoll = this.#buildRollSnapshot(roll, procedure);
      const exportCtx = (typeof procedure.exportForContest === "function" ? procedure.exportForContest() : {}) || {};

      // Local full contest (docs ok locally)
      const contest = {
         id: contestId,
         initiator: {
            actorId: initiator.id,
            userId: game.user.id,
         },
         target: targetActor,
         initiatorRoll,
         targetRoll: null,
         isResolved: false,
         procedure: {
            class: procedure?.constructor?.name ?? "AbstractProcedure",
            json: typeof procedure.toJSON === "function" ? procedure.toJSON() : null,
            export: exportCtx,
         },
         defenseHint: (typeof procedure.getDefenseHint === "function" && procedure.getDefenseHint()) || {
            type: "attribute",
            key: "reaction",
            tnMod: 0,
            tnLabel: "",
         },
         phase: "awaiting-response",
         tokenRef: {
            tokenId: targetToken?.id ?? targetToken?.document?.id ?? null,
            sceneId: targetToken?.scene?.id ?? targetToken?.document?.parent?.id ?? null,
         },
      };

      activeContests.set(contestId, contest);

      // Prepare and send *stub* to other clients
      const initiatorUser = this.resolveControllingUser(initiator);
      const targetUser = this.resolveControllingUser(targetActor);

      const stub = {
         contestId,
         initiator: {
            actorId: initiator.id,
            userId: game.user.id,
         },
         target: {
            actorId: targetActor?.id,
            name: targetActor?.name,
            tokenId: contest.tokenRef.tokenId,
            sceneId: contest.tokenRef.sceneId,
         },
         initiatorRoll,
         procedure: contest.procedure, // includes exportCtx
         defenseHint: contest.defenseHint,
      };

      if (initiatorUser?.id !== game.user.id) await initiatorUser.query("sr3e.opposeRollPrompt", stub);
      if (targetUser?.id !== game.user.id) await targetUser.query("sr3e.opposeRollPrompt", stub);

      // Chat prompt (whisper to the two involved)
      const whisperIds = [initiatorUser?.id, targetUser?.id].filter(Boolean);
      const msg = await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: initiator }),
         whisper: whisperIds,
         content: `
         <p><strong>${initiator?.name}</strong> has initiated an opposed roll against <strong>${targetActor?.name}</strong>.</p>
         <div class="sr3e-response-button-container" data-contest-id="${contestId}"></div>
       `,
         flags: { "sr3e.opposed": contestId },
      });

      return contestId;
      contest.messageId = msg?.id ?? null;

      const timeoutMs = Number(game.settings?.get?.("sr3e", "contestTimeoutMs")) || 600000;
      contest.timer = setTimeout(() => {
         try {
            OpposeRollService.abortOpposedRoll(contestId, { reason: "timeout" });
         } catch {}
      }, timeoutMs);
      activeContests.set(contestId, contest);
      return contestId;
   }

   static resolveControllingUser(actor) {
      const connected = game.users.filter((u) => u.active);
      const assigned = connected.find((u) => u.character?.id === actor?.id);
      if (assigned) return assigned;

      const owner = connected.find(
         (u) => !u.isGM && actor?.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
      );
      if (owner) return owner;

      return connected.find((u) => u.isGM);
   }

   static #buildRollSnapshot(roll, procedure) {
      const json = roll.toJSON();

      // Ensure TN present for success counting in UI
      const tn = Number(procedure?.finalTN?.({ floor: 2 }) ?? null);
      json.options = json.options || {};
      if (Number.isFinite(tn)) json.options.targetNumber = tn;
      else delete json.options.targetNumber;

      // Carry procedure-provided flavor/description (optional)
      json.meta = {
         flavor: procedure?.getFlavor?.() ?? "",
         descriptionHtml: procedure?.getChatDescription?.() ?? "",
         procedureKind: procedure?.constructor?.name ?? "AbstractProcedure",
      };

      return json;
   }

   // -----------------------
   // Resolve opposed result
   // -----------------------
   // OpposeRollService.js (only this method shown)
   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      if (!contest) throw new Error("sr3e: contest not found");

      contest.targetRoll = rollData;
      contest.isResolved = true;

      const initiator = game.actors.get(contest.initiator?.actorId) || null;
      const target = contest.target;
      const initiatorRoll = contest.initiatorRoll;
      const targetRoll = contest.targetRoll;

      const exportCtx = contest.procedure?.export || null;
      const procJSON = contest.procedure?.json || null;
      if (!procJSON) throw new Error("sr3e: missing procedure json");

      // Rehydrate the initiator procedure
      const initiatorProc = await AbstractProcedure.fromJSON(procJSON);

      // Let subclass do bookkeeping if needed
      if (initiatorProc.onChallengeResolved && initiator) {
         await initiatorProc.onChallengeResolved({ roll: initiatorRoll, actor: initiator });
      }

      const netSuccesses = this.computeNetSuccesses(initiatorRoll, targetRoll);
      const winner = netSuccesses >= 0 ? initiator : target;

      // Ask the initiator procedure to render the *combined* opposed message
      const out = await initiatorProc.renderContestOutcome(exportCtx, {
         initiator,
         target,
         initiatorRoll,
         targetRoll,
         netSuccesses,
         winner,
      });
      const htmlOut = typeof out === "string" ? out : out?.html;
      if (!htmlOut) throw new Error("sr3e: renderContestOutcome returned no HTML");

      const targetUser = this.resolveControllingUser(target);
      const chatData = this.#prepareChatData({
         speaker: initiator,
         initiator: contest.initiator,
         targetUserId: targetUser?.id,
         content: htmlOut,
         rollMode: game.settings.get("core", "rollMode"),
      });
      await ChatMessage.create(chatData);

      // (If your item procedures use damage resistance, keep that path here;
      // attribute contests won’t provide resistancePrep and that’s fine.)
   }

   // -----------------------
   // Prompt & resolve resistance
   // -----------------------
   // Helper remains strict but without manual throws
   static #computeTNFromPrep(prep) {
      const base = Number(prep.tnBase);
      const sum = prep.tnMods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      return Math.max(2, base + sum);
   }

   static async promptDamageResistance(resistancePayload) {
      const { contestId, initiatorId, defenderId, weaponId, prep } = resistancePayload;

      const defender = game.actors.get(defenderId);
      if (!defender) return ui.notifications.warn("Defender not found");

      let weaponName = prep?.weaponName || "Attack";
      if (weaponId) {
         const initiator = game.actors.get(initiatorId);
         const w = initiator?.items.get(weaponId) || game.items.get(weaponId);
         if (w?.name) weaponName = w.name;
      }

      const defenderUser = this.resolveControllingUser(defender);
      const context = { contestId, initiatorId, defenderId, weaponId, prep };

      // Inside promptDamageResistance: compute tnHtml without throws/fallbacks
      const base = Number(prep.tnBase);
      const mods = prep.tnMods; // expect array
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      const finalTN = Math.max(2, base + sum);

      const items = mods
         .map((m) => {
            const v = Number(m.value) || 0;
            const sign = v >= 0 ? "+" : "−";
            const abs = Math.abs(v);
            return `<li><span>${m.name}</span><b>${sign}${abs}</b></li>`;
         })
         .join("");

      const tnHtml = `
  <div class="sr3e-tn-breakdown">
    <p>Resistance TN: <b>${finalTN}</b> <small>(base ${base}${
         sum ? (sum > 0 ? ` + ${sum}` : ` − ${Math.abs(sum)}`) : ""
      })</small></p>
    ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
  </div>`;

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: defender }),
         whisper: [defenderUser?.id].filter(Boolean),
         content: `
      <p><strong>${defender.name}</strong>, resist
      <strong>${String(prep.stagedStepBeforeResist || "").toUpperCase()}</strong> ${prep.trackKey}
      damage from <em>${weaponName}</em>.</p>
      ${tnHtml}
      <div class="sr3e-resist-damage-button" data-context='${encodeURIComponent(JSON.stringify(context))}'></div>
    `,
         flags: { sr3e: { damageResistance: context } },
      });
   }

   static async resolveDamageResistanceFromRoll({ defenderId, weaponId, prep, rollData }) {
      // --- 1) Resolve defender & roll ------------------------------------------------
      const defender = game.actors.get(defenderId);
      if (!defender) throw new Error("sr3e: Defender not found");

      const roll = await Roll.fromData(rollData);
      if (!roll._evaluated) await roll.evaluate();

      // --- 2) Compute TN strictly from prep (base + resistance-step mods) ------------
      const base = Number(prep?.tnBase ?? 4);
      const mods = Array.isArray(prep?.tnMods) ? prep.tnMods : [];
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      const tn = Math.max(2, base + sum);

      // Count successes at that TN (do not mutate stored roll; pass TN in options)
      const successes = this.getSuccessCount({
         ...rollData,
         options: { ...(rollData.options || {}), targetNumber: tn },
      });

      // --- 3) Resolve outcome via family service (strict: no fallback) ---------------
      const familyKey = String(prep?.familyKey || "");
      let svc = null;
      if (familyKey === "firearm") svc = FirearmService;
      else if (familyKey === "melee") svc = MeleeService;
      else throw new Error(`sr3e: Unknown resistance familyKey "${familyKey}"`);

      const outcome = svc.resolveDamageOutcome(prep, successes);

      // --- 4) Apply result to health tracks ------------------------------------------
      const trackKey = outcome.trackKey === "stun" ? "stun" : "physical";
      const trackPath = trackKey === "stun" ? "system.health.stun.value" : "system.health.physical.value";
      const maxPath = trackKey === "stun" ? "system.health.stun.max" : "system.health.physical.max";

      const current = Number(foundry.utils.getProperty(defender, trackPath) || 0);
      const max = Number(foundry.utils.getProperty(defender, maxPath) || 10);
      const next = Math.min(current + outcome.boxes, max);
      const overflow = Math.max(0, current + outcome.boxes - max);

      const update = { [trackPath]: next };
      if (overflow > 0 && trackKey === "physical") {
         update["system.health.overflow.value"] = Number(defender.system?.health?.overflow?.value || 0) + overflow;
      }
      if (outcome.applied) await defender.update(update);

      // --- 5) Post a concise result message ------------------------------------------
      const rollHTML = await roll.render();
      const defenderUser = this.resolveControllingUser(defender);
      const gmIds = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
      const whisper = Array.from(new Set([defenderUser?.id, ...gmIds].filter(Boolean)));

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: defender }),
         whisper,
         content: `
      <p><strong>${defender.name}</strong> resists damage from <em>${prep?.weaponName || "Attack"}</em>.</p>
      <p>Resistance TN: <b>${tn}</b> &nbsp;|&nbsp; Successes: <b>${successes}</b></p>
      ${rollHTML}
      <p>Pre-resist level: <b>${String(prep.stagedStepBeforeResist || "").toUpperCase()}</b> (${prep.trackKey})</p>
      <p>Final level: <b>${outcome.finalStep ? outcome.finalStep.toUpperCase() : "NONE"}</b>
         → Boxes applied: <b>${outcome.boxes}</b> (${trackKey})</p>
      ${overflow > 0 ? `<p>Overflow: <b>${overflow}</b></p>` : ""}
    `,
      });

      // --- 6) Cleanup contest if present ---------------------------------------------
      if (prep?.contestId) activeContests.delete(prep.contestId);
   }

   // -----------------------
   // Utilities
   // -----------------------
   static computeNetSuccesses(initiatorRollData, targetRollData) {
      const initiatorSuccesses = this.getSuccessCount(initiatorRollData);
      const targetSuccesses = this.getSuccessCount(targetRollData);
      return initiatorSuccesses - targetSuccesses;
   }

   static getSuccessCount(rollData) {
      const term = rollData.terms?.[0];
      const tn = rollData.options?.targetNumber;
      if (!tn || !term?.results) return 0;
      return term.results.filter((r) => r.active && r.result >= tn).length;
   }

   static #prepareChatData({ speaker, initiator, targetUserId, content, rollMode }) {
      const userId = initiator?.userId;
      const chatData = {
         speaker: ChatMessage.getSpeaker({ actor: speaker }),
         user: userId,
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
            chatData.whisper = [userId, targetUserId].filter(Boolean);
            break;
         case "public":
         default:
            break;
      }
      return chatData;
   }
}
