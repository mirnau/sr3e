import SR3ERoll from "@documents/SR3ERoll.js";
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
      if (contest) {
         activeContests.delete(contestId);
         console.log("[sr3e] Contest expired.");
      }
   }

   static abortOpposedRoll(contestId) {
      return this.expireContest(contestId);
   }

   /**
    * Local registration on any client that receives the stub via query.
    * The stub ONLY contains ids (no heavy docs). We resolve to Actor docs here.
    */
   static registerContestStub(stub) {
      const { contestId, initiatorId, target, initiatorRoll, procedure, defenseHint } = stub;

      const initiator = game.actors.get(initiatorId) || null;
      const targetActorId = target?.actorId ?? null;
      const targetActor = targetActorId ? game.actors.get(targetActorId) : null;

      const contest = {
         id: contestId,
         initiator: {
            actorId: initiator.id,
            userId: game.user.id, // <- initiatorUserId
         },
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
            userId: game.user.id, // <- initiatorUserId
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
            userId: game.user.id, // <- initiatorUserId
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
      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: initiator }),
         whisper: whisperIds,
         content: `
        <p><strong>${initiator?.name}</strong> has initiated an opposed roll against <strong>${targetActor?.name}</strong>.</p>
        <div class="sr3e-response-button-container" data-contest-id="${contestId}"></div>
      `,
         flags: { "sr3e.opposed": contestId },
      });

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
   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      if (!contest) return;

      contest.targetRoll = rollData;
      contest.isResolved = true;

      const initiator = contest.initiator;
      const target = contest.target;
      const initiatorRoll = contest.initiatorRoll;
      const targetRoll = contest.targetRoll;

      const exportCtx = contest.procedure?.export || null;
      const procJSON = contest.procedure?.json || null;

      const netSuccesses = this.computeNetSuccesses(initiatorRoll, targetRoll);
      const winner = netSuccesses > 0 ? initiator : target;

      // Attempt to rehydrate the initiator procedure to let it render & prep
      let initiatorProc = null;
      try {
         if (procJSON) initiatorProc = await AbstractProcedure.fromJSON(procJSON);
      } catch (e) {
         console.warn("[sr3e] Failed to rehydrate initiator procedure:", e);
      }

      // 1) Let subclass render contested chat (and optionally provide resistance prep)
      let htmlOut = null;
      let resistancePrep = null;

      if (initiatorProc?.renderContestOutcome) {
         try {
            const out = await initiatorProc.renderContestOutcome(exportCtx, {
               initiator,
               target,
               initiatorRoll,
               targetRoll,
               netSuccesses,
               winner,
            });
            if (typeof out === "string") {
               htmlOut = out;
            } else if (out && typeof out === "object") {
               htmlOut = out.html ?? null;
               resistancePrep = out.resistancePrep ?? null;
            }
         } catch (e) {
            console.warn("[sr3e] renderContestOutcome failed; using fallback:", e);
         }
      }

      // 2) If attacker wins but no prep provided yet, ask subclass to build it, else fallback
      if (winner === initiator && !resistancePrep) {
         try {
            if (initiatorProc?.buildResistancePrep) {
               resistancePrep = initiatorProc.buildResistancePrep(exportCtx, { initiator, target }) || null;
            }
         } catch (e) {
            console.warn("[sr3e] buildResistancePrep failed; will fallback to service:", e);
         }

         // Final fallback using familyKey snapshot
         if (!resistancePrep && exportCtx?.familyKey) {
            const svc = exportCtx.familyKey === "firearm" ? FirearmService : MeleeService;
            resistancePrep =
               exportCtx.familyKey === "firearm"
                  ? svc.prepareDamageResolution(target, { plan: exportCtx.plan, damage: exportCtx.damage })
                  : svc.prepareDamageResolution(target, { packet: exportCtx.damage });

            // annotate a few convenience fields
            if (resistancePrep) {
               resistancePrep.familyKey = exportCtx.familyKey;
               resistancePrep.weaponId = exportCtx.weaponId || null;
               resistancePrep.weaponName = exportCtx.weaponName || "Attack";
               if (exportCtx.tnBase != null) resistancePrep.tnBase = exportCtx.tnBase;
               if (Array.isArray(exportCtx.tnMods)) resistancePrep.tnMods = exportCtx.tnMods.slice();
            }
         }
      }

      // 3) Build fallback damage text if we have resistance prep and no custom HTML
      let damageText = "";
      if (winner === initiator && resistancePrep && !htmlOut) {
         damageText = `
        <p><strong>${target.name}</strong> must resist
        <strong>${String(resistancePrep.stagedStepBeforeResist || "").toUpperCase()}</strong> damage
        (${resistancePrep.trackKey}) from <em>${resistancePrep.weaponName || "Attack"}</em>.</p>
      `;
      }

      // 4) Final contested chat HTML
      const content =
         htmlOut ??
         this.#buildContestMessage({
            initiator,
            target,
            initiatorRoll,
            targetRoll,
            winner,
            netSuccesses,
            damageText,
         });

      const chatData = this.#prepareChatData({
         speaker: initiator,
         initiatorUserId,
         targetUser: this.resolveControllingUser(target),
         content,
         rollMode: game.settings.get("core", "rollMode"),
      });

      await ChatMessage.create(chatData);

      contest.phase = "awaiting-resistance";
      activeContests.set(contest.id, contest);

      // 5) If we have a resistance prep, prompt defender
      if (winner === initiator && resistancePrep) {
         try {
            // Ensure a few fields are set for the prompt step
            resistancePrep.contestId = contest.id;
            resistancePrep.attackerId = initiator.id;
            const weaponId = resistancePrep.weaponId ?? exportCtx?.weaponId ?? null;

            const payload = {
               contestId: contest.id,
               initiatorId: initiator.id,
               defenderId: target.id,
               weaponId,
               prep: resistancePrep,
            };

            setTimeout(() => {
               OpposeRollService.promptDamageResistance(payload).catch(console.error);
            }, 200);
         } catch (e) {
            console.error("[sr3e] Failed to prompt damage resistance:", e);
         }
      }
   }

   // -----------------------
   // Prompt & resolve resistance
   // -----------------------
   static #computeTNFromPrep(prep) {
      const base = Number(prep?.tnBase ?? 4);
      const sum = (Array.isArray(prep?.tnMods) ? prep.tnMods : []).reduce((a, m) => a + (Number(m.value) || 0), 0);
      return Math.max(2, base + sum);
   }

   static async promptDamageResistance(resistancePayload) {
      const { contestId, initiatorId, defenderId, weaponId, prep } = resistancePayload;

      const defender = game.actors.get(defenderId);
      if (!defender) return ui.notifications.warn("Defender not found");

      // Prefer annotated weaponName; fall back to doc if we can resolve it.
      let weaponName = prep?.weaponName || "Attack";
      if (weaponId) {
         const initiator = game.actors.get(initiatorId);
         const w = initiator?.items.get(weaponId) || game.items.get(weaponId);
         if (w?.name) weaponName = w.name;
      }

      const defenderUser = this.resolveControllingUser(defender);
      const context = { contestId, initiatorId, defenderId, weaponId, prep };

      const tnHtml = (() => {
         const base = Number(prep?.tnBase ?? 4);
         const mods = Array.isArray(prep?.tnMods) ? prep.tnMods : [];
         const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
         const finalTN = Math.max(2, base + sum);

         const items = mods
            .map((m) => {
               const sign = (Number(m.value) || 0) >= 0 ? "+" : "−";
               const abs = Math.abs(Number(m.value) || 0);
               return `<li><span>${m.name}</span><b>${sign}${abs}</b></li>`;
            })
            .join("");

         return `
         <div class="sr3e-tn-breakdown">
           <p>Resistance TN: <b>${finalTN}</b> <small>(base ${base}${
            sum ? (sum > 0 ? ` + ${sum}` : ` − ${Math.abs(sum)}`) : ""
         })</small></p>
           ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
         </div>`;
      })();

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: defender }),
         whisper: [defenderUser.id],
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
      const defender = game.actors.get(defenderId);
      if (!defender) throw new Error("sr3e: Defender not found");

      const roll = await Roll.fromData(rollData);
      if (!roll._evaluated) await roll.evaluate();

      const tn = this.#computeTNFromPrep(prep);
      const successes = this.getSuccessCount({
         ...rollData,
         options: { ...(rollData.options || {}), targetNumber: tn },
      });

      const svc = prep?.familyKey === "firearm" ? FirearmService : MeleeService;
      const outcome = svc.resolveDamageOutcome(prep, successes);

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

   static #buildContestMessage({ initiator, target, initiatorRoll, targetRoll, winner, netSuccesses, damageText }) {
      const initiatorHtml = SR3ERoll.renderVanilla(initiator, initiatorRoll);
      const targetHtml = SR3ERoll.renderVanilla(target, targetRoll);

      return `
      <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
      <h4>${initiator.name}</h4>
      ${initiatorHtml}
      <h4>${target.name}</h4>
      ${targetHtml}
      <p><strong>${winner.name}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
      ${damageText ?? ""}`;
   }

   static #prepareChatData({ speaker, initiatorUserId, targetUserId, content, rollMode }) {
      const chatData = {
         speaker: ChatMessage.getSpeaker({ actor: speaker }),
         user: initiatorUserId, // author is the initiator’s user id
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
            chatData.whisper = [initiatorUserId, targetUserId].filter(Boolean);
            break;
         case "public":
         default:
            break;
      }
      return chatData;
   }
}
