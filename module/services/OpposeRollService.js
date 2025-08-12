import SR3ERoll from "@documents/SR3ERoll.js";
import FirearmService from "@families/FirearmService.js";
import MeleeService from "@families/MeleeService.js";

const activeContests = new Map();
const pendingResponses = new Map();

export default class OpposeRollService {
  // -----------------------------
  // Inference (no system.family)
  // -----------------------------
  static #num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  static #hasAmmoSignals(sys) {
    if (!sys) return false;
    if (sys.ammunitionClass || sys.ammoId) return true;
    const inMag = this.#num(sys?.ammo?.inMag ?? sys?.ammo);
    return inMag !== null;
  }

  static #hasFirearmMode(sys) {
    const m = String(sys?.mode ?? "").toLowerCase();
    if (!m) return false;
    // align with your firearm modes
    return ["manual", "semiauto", "burst", "fullauto", "ss", "sa", "bf", "fa"].includes(m);
  }

  static #isFirearmByHeuristic(weapon) {
    const sys = weapon.system ?? {};
    // IMPORTANT: ignore range bands; many melee items have defaults
    return this.#hasAmmoSignals(sys) || this.#hasFirearmMode(sys);
  }

  static #isMeleeByHeuristic(weapon) {
    // numeric reach is an explicit melee signal in your schema
    return this.#num(weapon?.system?.reach) !== null;
  }

  static #serviceForWeapon(weapon) {
    if (!weapon || weapon.type !== "weapon") throw new Error("sr3e: weapon required");

    if (this.#isFirearmByHeuristic(weapon)) return { key: "firearm", svc: FirearmService };
    if (this.#isMeleeByHeuristic(weapon))   return { key: "melee",   svc: MeleeService };

    // Default to melee when there are no firearm signals
    return { key: "melee", svc: MeleeService };
  }

  // -----------------------
  // Contest bookkeeping API
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
  // Contest lifecycle
  // -----------------------
  static getDefaultDefenseHint(initiatorRoll) {
    const o = initiatorRoll?.options ?? {};
    if (o.type !== "item" || !o.itemId) {
      // Neutral default (don’t call firearm code when we don’t have an item)
      return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
    }

    const actor = ChatMessage.getSpeakerActor?.(o.speaker);
    const weapon = game.items.get(o.itemId) || actor?.items?.get?.(o.itemId) || null;
    if (!weapon) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };

    const { svc } = this.#serviceForWeapon(weapon);
    return svc.getDefenseHintFromAttack?.(initiatorRoll) ?? { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
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
      defenseHint: OpposeRollService.getDefaultDefenseHint(rollData),
      isResolved: false,
    });
  }

  static async start({ initiator, target, rollData, options }) {
    const contestId = foundry.utils.randomID(16);
    this.registerContest({ contestId, initiator, target, rollData, options });

    const initiatorUser = this.resolveControllingUser(initiator);
    const targetUser = this.resolveControllingUser(target);
    const payload = { contestId, initiatorId: initiator.id, targetId: target.id, rollData, options };

    if (initiatorUser?.id !== game.user.id) await initiatorUser.query("sr3e.opposeRollPrompt", payload);
    if (targetUser?.id !== game.user.id) await targetUser.query("sr3e.opposeRollPrompt", payload);

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

  // -----------------------
  // Attack setup
  // -----------------------
  static #ensureAttackContext(contest) {
    const { initiator, initiatorRoll, options } = contest;
    const o = initiatorRoll?.options ?? {};

    const itemId = o.itemId ?? o.key ?? null;
    if (!itemId) return null;

    const weapon = initiator?.items?.get(itemId) || game.items.get(itemId);
    if (!weapon || weapon.type !== "weapon") return null;

    const { key: serviceKey, svc } = this.#serviceForWeapon(weapon);

    let attackContext;
    if (serviceKey === "firearm") {
      const declaredRounds = options?.declaredRounds ?? o.declaredRounds ?? null;
      const { plan, damage, ammoId } = svc.beginAttack(initiator, weapon, {
        declaredRounds,
        ammoAvailable: null,
        rangeBand: null,
      });
      // firearm recoil bump on contest setup
      svc.bumpOnShot({ actor: initiator, weapon, declaredRounds: plan.roundsFired });

      attackContext = {
        serviceKey,
        weaponId: weapon.id,
        ammoId: ammoId || "",
        plan,
        damage,
        rangeData: weapon.system?.rangeBand ?? null,
      };
    } else {
      // melee
      const defender = contest.target;
      const situational = {
        calledShot: !!o.calledShot,
        tnAdd: Number(o.tnAdd || 0) || 0,
        positionTNAdd: Number(o.positionTNAdd || 0) || 0,
        ...(options?.situational || {}),
      };
      const meleePlan = svc.planStrike({ attacker: initiator, defender, weapon, situational });

      // optional UI hint
      contest.defenseHint = {
        type: "skill",
        key: "melee",
        tnMod: meleePlan.defenderTNAdd ?? 0,
        tnLabel: "Melee defense",
      };

      attackContext = {
        serviceKey,
        weaponId: weapon.id,
        plan: {
          attackerTNAdd: meleePlan.attackerTNAdd,
          defenderTNAdd: meleePlan.defenderTNAdd,
          levelDelta: meleePlan.levelDelta,
          notes: meleePlan.notes,
        },
        damage: meleePlan.packet, // DamagePacket
        rangeData: null,
      };
    }

    contest.attackContext = attackContext;
    activeContests.set(contest.id, contest);
    return attackContext;
  }

  // -----------------------
  // Resolve opposed result
  // -----------------------
  static async resolveTargetRoll(contestId, rollData) {
    const contest = activeContests.get(contestId);
    contest.targetRoll = rollData;
    contest.isResolved = true;

    let { initiator, target, initiatorRoll, targetRoll, attackContext } = contest;
    if (!attackContext) attackContext = this.#ensureAttackContext(contest);

    const netSuccesses = this.computeNetSuccesses(initiatorRoll, targetRoll);
    const winner = netSuccesses > 0 ? initiator : target;

    let damageText = "";
    let resistancePayload = null;

    if (winner === initiator && attackContext?.weaponId) {
      const weapon = initiator.items.get(attackContext.weaponId) || game.items.get(attackContext.weaponId);
      if (weapon?.type === "weapon") {
        const { svc } = this.#serviceForWeapon(weapon);
        const prep =
          attackContext.serviceKey === "firearm"
            ? svc.prepareDamageResolution(target, {
                plan: attackContext.plan,
                damage: attackContext.damage,
                netAttackSuccesses: netSuccesses,
              })
            : svc.prepareDamageResolution(target, {
                packet: attackContext.damage,
                netAttackSuccesses: netSuccesses,
              });

        // annotate for later
        prep.contestId = contest.id;
        prep.attackerId = initiator.id;

        damageText = `
          <p><strong>${target.name}</strong> must resist
          <strong>${prep.stagedStepBeforeResist.toUpperCase()}</strong> damage
          (${prep.trackKey}) from <em>${weapon.name}</em>.
          Resistance TN: <b>${prep.tn}</b>.</p>`;

        resistancePayload = {
          contestId,
          initiatorId: initiator.id,
          defenderId: target.id,
          weaponId: weapon.id,
          prep,
        };
      }
    }

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

    ui.windows[`sr3e-opposed-roll-${contestId}`]?.close();
    contest.phase = "awaiting-resistance";
    activeContests.set(contestId, contest);

    if (resistancePayload) {
      setTimeout(() => {
        this.promptDamageResistance(resistancePayload).catch(console.error);
      }, 200);
    }
  }

  // -----------------------
  // Prompt & resolve resistance
  // -----------------------
  static async promptDamageResistance(resistancePayload) {
    const { contestId, initiatorId, defenderId, weaponId, prep } = resistancePayload;

    const defender = game.actors.get(defenderId);
    if (!defender) return ui.notifications.warn("Defender not found");

    const initiator = game.actors.get(initiatorId);
    const weapon = initiator?.items.get(weaponId) || game.items.get(weaponId);
    if (!weapon) return ui.notifications.warn("Weapon not found");

    const defenderUser = this.resolveControllingUser(defender);

    const context = { contestId, initiatorId, defenderId, weaponId, prep };

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: defender }),
      whisper: [defenderUser.id],
      content: `
        <p><strong>${defender.name}</strong>, resist
        <strong>${prep.stagedStepBeforeResist.toUpperCase()}</strong> ${prep.trackKey}
        damage from <em>${weapon.name}</em> (TN <b>${prep.tn}</b>).</p>
        <div class="sr3e-resist-damage-button" data-context='${encodeURIComponent(JSON.stringify(context))}'></div>
      `,
      flags: { sr3e: { damageResistance: context } },
    });
  }

  static async resolveDamageResistanceFromRoll({ defenderId, weaponId, prep, rollData }) {
    const defender = game.actors.get(defenderId);
    if (!defender) throw new Error("sr3e: Defender not found");

    const roll = await Roll.fromData(rollData);
    if (!roll._evaluated) await roll.evaluate({ async: true });

    const tn = Number(prep.tn);
    const successes = this.getSuccessCount({
      ...rollData,
      options: { ...(rollData.options || {}), targetNumber: tn },
    });

    // get weapon from attacker if possible (preferred)
    const attacker = prep?.attackerId ? game.actors.get(prep.attackerId) : null;
    const weapon = attacker?.items.get(weaponId) || game.items.get(weaponId);
    if (!weapon) throw new Error("sr3e: Weapon not found");

    const { svc } = this.#serviceForWeapon(weapon);
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
        <p><strong>${defender.name}</strong> resists damage from <em>${weapon.name}</em>.</p>
        <p>Resistance TN: <b>${tn}</b> &nbsp;|&nbsp; Successes: <b>${successes}</b></p>
        ${rollHTML}
        <p>Pre-resist level: <b>${(prep.stagedStepBeforeResist ?? "").toString().toUpperCase()}</b> (${prep.trackKey})</p>
        <p>Final level: <b>${outcome.finalStep ? outcome.finalStep.toUpperCase() : "NONE"}</b>
           → Boxes applied: <b>${outcome.boxes}</b> (${trackKey})</p>
        ${overflow > 0 ? `<p>Overflow: <b>${overflow}</b></p>` : ""}
      `,
    });

    const cid = prep?.contestId;
    if (cid) activeContests.delete(cid);
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
    const initiatorHtml = this.#buildDiceHTML(initiator, initiatorRoll);
    const targetHtml = this.#buildDiceHTML(target, targetRoll);

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

  static #buildDiceHTML(actor, rollData) {
    return SR3ERoll.renderVanilla(actor, rollData);
  }
}
