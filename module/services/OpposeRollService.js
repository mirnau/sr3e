import SR3ERoll from "@documents/SR3ERoll.js";
import FirearmService from "@families/FirearmService.js";
import MeleeService from "@families/MeleeService.js";

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

  // -----------------------
  // Procedure-driven start
  // -----------------------
  /**
   * Start an opposed roll using the procedure as the single source of truth.
   * Required procedure surface:
   *   - caller : Actor (initiator)
   *   - getFlavor(): string  (used in the prompt message)
   *   - exportForContest(): {
   *       familyKey: 'firearm' | 'melee' | 'generic',
   *       weaponId?: string,
   *       weaponName?: string,
   *       plan?: any,          // firearm plan (if applicable)
   *       damage?: any,        // DamagePacket or equivalent
   *       tnBase?: number,     // optional (resistance UI)
   *       tnMods?: Array<{id?:string,name:string,value:number}>
   *     }
   *   - (optional) getDefenseHint(): { type:'attribute'|'skill', key:string, tnMod:number, tnLabel:string }
   */
  static async startProcedure({ procedure, target, initiatorRoll }) {
    const initiator = procedure.caller;
    if (!initiator) throw new Error("OpposeRollService.startProcedure: procedure.caller required");

    const contestId = foundry.utils.randomID(16);

    // Take a compact snapshot of what we need later; avoid keeping live objects around.
    const procSnap = {
      ...((typeof procedure.exportForContest === "function" && procedure.exportForContest()) || {}),
      flavor: String(procedure.getFlavor?.() ?? ""),
      // keep a small identity so we can render better messages
      itemId: procedure.item?.id || null,
    };

    const defenseHint = procedure.getDefenseHint?.() || { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };

    activeContests.set(contestId, {
      id: contestId,
      initiator,
      target,
      initiatorRoll,
      targetRoll: null,
      proc: procSnap,
      defenseHint,
      isResolved: false,
      phase: "started",
    });

    // Notify relevant users
    const initiatorUser = this.resolveControllingUser(initiator);
    const targetUser = this.resolveControllingUser(target);
    const payload = { contestId, initiatorId: initiator.id, targetId: target.id };

    if (initiatorUser?.id !== game.user.id) await initiatorUser.query("sr3e.opposeRollPrompt", payload);
    if (targetUser?.id !== game.user.id) await targetUser.query("sr3e.opposeRollPrompt", payload);

    const whisper = [initiatorUser?.id, targetUser?.id].filter(Boolean);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: initiator }),
      whisper,
      content: `
        <p><strong>${initiator.name}</strong> has initiated an opposed roll against <strong>${target.name}</strong>.</p>
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

  // -----------------------
  // Resolve opposed result
  // -----------------------
  static async resolveTargetRoll(contestId, rollData) {
    const contest = activeContests.get(contestId);
    if (!contest) return;

    contest.targetRoll = rollData;
    contest.isResolved = true;

    const { initiator, target, initiatorRoll, targetRoll, proc } = contest;
    const netSuccesses = this.computeNetSuccesses(initiatorRoll, targetRoll);
    const winner = netSuccesses > 0 ? initiator : target;

    let damageText = "";
    let resistancePayload = null;

    // If the initiator wins and we have an attack context snapshot, prepare resistance
    if (winner === initiator && proc?.familyKey) {
      const svc = proc.familyKey === "firearm" ? FirearmService : MeleeService;

      const prep =
        proc.familyKey === "firearm"
          ? svc.prepareDamageResolution(target, { plan: proc.plan, damage: proc.damage })
          : svc.prepareDamageResolution(target, { packet: proc.damage });

      // annotate for later; keep everything we need for the resist step
      prep.contestId = contest.id;
      prep.attackerId = initiator.id;
      prep.familyKey = proc.familyKey;
      prep.weaponId = proc.weaponId || null;
      prep.weaponName = proc.weaponName || "Attack";

      damageText = `
        <p><strong>${target.name}</strong> must resist
        <strong>${String(prep.stagedStepBeforeResist || "").toUpperCase()}</strong> damage
        (${prep.trackKey}) from <em>${prep.weaponName}</em>.</p>
      `;

      resistancePayload = {
        contestId: contest.id,
        initiatorId: initiator.id,
        defenderId: target.id,
        weaponId: proc.weaponId || null,
        prep,
      };
    }

    // Compose chat output with both dice pools
    const content = this.#buildContestMessage({
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
      initiatorUser: this.resolveControllingUser(initiator),
      targetUser: this.resolveControllingUser(target),
      content,
      rollMode: game.settings.get("core", "rollMode"),
    });

    await ChatMessage.create(chatData);

    contest.phase = "awaiting-resistance";
    activeContests.set(contest.id, contest);

    if (resistancePayload) {
      setTimeout(() => {
        OpposeRollService.promptDamageResistance(resistancePayload).catch(console.error);
      }, 200);
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

    // Show weapon name if possible; otherwise rely on prep annotation
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
}
