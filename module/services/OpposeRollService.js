import SR3ERoll from "@documents/SR3ERoll.js";
import FirearmService from "@services/FirearmService.js";

const activeContests = new Map();
const pendingResponses = new Map();

export default class OpposeRollService {
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
      resolver(rollData);
      pendingResponses.delete(contestId);
   }

   static expireContest(contestId) {
      const contest = activeContests.get(contestId);
      if (contest) {
         activeContests.delete(contestId);
         console.log("[sr3e] Contest expired.");
      }
   }

   static getDefaultDefenseHint(initiatorRoll) {
      return FirearmService.getDefenseHintFromAttack(initiatorRoll);
   }

   static getContestForTarget(target) {
      return [...activeContests.values()].find((c) => c.target.id === target.id && !c.isResolved);
   }

   static getDefaultDefenseHint(initiatorRoll) {
      const o = initiatorRoll?.options ?? {};
      if (o.type === "item" && o.itemId) {
         const weapon =
            game.items.get(o.itemId) || ChatMessage.getSpeakerActor(o.speaker)?.items?.get?.(o.itemId) || null;

         const tnMod = Number(weapon?.system?.defense?.tnMod ?? weapon?.system?.dodgeTNMod ?? 0);

         const tnLabel = weapon?.system?.defense?.tnLabel ?? "Weapon difficulty";

         return { type: "attribute", key: "reaction", tnMod, tnLabel };
      }
      return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
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

   // OpposeRollService.js
   static async start({ initiator, target, rollData, options }) {
      const contestId = foundry.utils.randomID(16);
      this.registerContest({ contestId, initiator, target, rollData, options });

      // >>> recoil accounting: bump phase shots now <<<
      try {
         const o = rollData?.options ?? {};
         if (o.type === "item" && o.itemId) {
            const actor = initiator;
            const weapon = actor?.items?.get(o.itemId) || game.items.get(o.itemId);
            if (weapon) {
               const already = FirearmService.getPhaseShots(actor.id);
               const plan = FirearmService.planFire({
                  weapon,
                  phaseShotsFired: already,
                  declaredRounds: options?.declaredRounds ?? o.declaredRounds ?? null,
                  ammoAvailable: weapon.system?.ammo?.value ?? null,
               });
               FirearmService.bumpPhaseShots(actor.id, plan.roundsFired);
            }
         }
      } catch (err) {
         console.error("[sr3e] recoil bump failed", err);
      }
      // <<< end bump >>>

      const targetUser = this.resolveControllingUser(target);
      await targetUser.query("sr3e.opposeRollPrompt", {
         contestId,
         initiatorId: initiator.id,
         targetId: target.id,
         rollData,
         options,
      });

      const initiatorUser = this.resolveControllingUser(initiator);
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

   static async resolveTargetRoll(contestId, rollData) {
      const contest = activeContests.get(contestId);
      contest.targetRoll = rollData;
      contest.isResolved = true;

      const { initiator, target, initiatorRoll, targetRoll } = contest;
      const netSuccesses = this.computeNetSuccesses(initiatorRoll, targetRoll);
      const winner = netSuccesses > 0 ? initiator : target;

      let damageText = "";
      const itemId = initiatorRoll.options?.itemId;
      console.log("[sr3e] Checking weapon roll payload", { itemId });

      let contestCopy = null;

      if (winner === initiator && itemId) {
         const weapon = initiator.items.get(itemId);
         console.log("[sr3e] Retrieved item for damage application", weapon);

         if (weapon?.type === "weapon") {
            const damageLevel = weapon.system.damage?.level ?? "M";
            const power = Number(weapon.system.damage?.power) || 0;
            const damageType = weapon.system.damage?.type ?? "Physical";

            const stagedLevel = this.stageDamage(damageLevel, netSuccesses);

            damageText = `<p><strong>${target.name}</strong> must resist <strong>${stagedLevel} ${damageType}</strong> damage from <em>${weapon.name}</em>.</p>`;

            contestCopy = {
               attacker: initiator,
               defender: target,
               weapon,
               power,
               stagedLevel,
               damageType,
               contestId,
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
      activeContests.delete(contestId); // important for cleanup

      if (contestCopy) {
         setTimeout(() => {
            this.promptDamageResistance(contestCopy).catch(console.error);
         }, 200);
      }
   }

   static async promptDamageResistance({ attacker, defender, weapon, power, stagedLevel, damageType, contestId }) {
      console.log("[sr3e] promptDamageResistance called", {
         attacker,
         defender,
         weapon,
         power,
         stagedLevel,
         damageType,
         contestId,
      });

      const defenderUser = this.resolveControllingUser(defender);

      try {
         const context = {
            stagedLevel,
            power,
            damageType,
            weaponId: weapon.id,
            defenderId: defender.id,
         };

         const message = await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: defender }),
            whisper: [defenderUser.id],
            content: `
               <p><strong>${
                  defender.name
               }</strong>, resist <strong>${stagedLevel} ${damageType}</strong> damage from <em>${weapon.name}</em>.</p>
               <div class="sr3e-resist-damage-button" data-context='${encodeURIComponent(
                  JSON.stringify(context)
               )}'></div>
            `,
            flags: {
               sr3e: {
                  damageResistance: context,
               },
            },
         });
         console.log("[sr3e] Damage resistance message created", message);
      } catch (err) {
         console.error("[sr3e] Failed to create damage resistance message", err);
      }
   }

   static async resolveDamageResistance({ stagedLevel, power, damageType, weaponId, defenderId }) {
      const actor = game.actors.get(defenderId);
      if (!actor) return ui.notifications.warn("Defender not found");

      const weapon = actor.items.get(weaponId) || game.items.get(weaponId);
      if (!weapon) return ui.notifications.warn("Weapon not found");

      const damageKey = damageType;
      const { baseLevel, healthType } = this.parseDamageType(damageKey);

      const body = actor.system.attributes.body.value || 0;
      const combatPool = actor.system.dicePools.combat.value || 0;
      const armorRating = 0; // TODO: integrate armor system later

      const tn = Math.max(2, power - armorRating);
      const dicePool = body + combatPool;

      const roll = await new Roll(`${dicePool}d6x${tn}`).evaluate();
      const successes = roll.terms[0].results.filter((r) => r.result >= tn && !r.discarded).length;

      const finalLevel = this.stageDamage(stagedLevel, -Math.floor(successes / 2));

      const damageBoxes =
         {
            L: 1,
            M: 3,
            S: 6,
            D: 10,
         }[finalLevel] || 0;

      const current = actor.system.health[healthType].value || 0;
      const max = actor.system.health[healthType].max || 10;

      const overflow = Math.max(0, current + damageBoxes - max);
      const finalValue = Math.min(current + damageBoxes, max);

      await actor.update({
         [`system.health.${healthType}.value`]: finalValue,
         ...(overflow > 0 && healthType === "physical"
            ? { "system.health.overflow.value": (actor.system.health.overflow.value || 0) + overflow }
            : {}),
      });

      const message = `
         <p><strong>${actor.name}</strong> resisted damage from <em>${weapon.name}</em>!</p>
         <p>Resistance successes: <strong>${successes}</strong></p>
         <p>Final damage level: <strong>${finalLevel}</strong> (${damageBoxes} boxes of ${healthType})</p>
         <p>Damage applied: ${damageBoxes} → ${healthType} now at ${finalValue}${
         overflow > 0 ? `, with ${overflow} overflow` : ""
      }</p>
      `;

      ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor }),
         content: message,
         style: CONST.CHAT_MESSAGE_STYLES.OTHER,
         whisper: [game.user.id],
      });
   }

   static stageDamage(baseLevel, netSuccesses) {
      const levels = ["L", "M", "S", "D"];
      let index = levels.indexOf(baseLevel);
      if (index === -1) index = 1;
      index += Math.floor(netSuccesses / 2);
      return levels[Math.min(index, levels.length - 1)];
   }

   static parseDamageType(damageTypeKey) {
      const isStun = damageTypeKey.toLowerCase().includes("stun");
      const base = damageTypeKey.replace(/stun/i, "").toUpperCase();
      return {
         baseLevel: base || "M",
         healthType: isStun ? "stun" : "physical",
      };
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
