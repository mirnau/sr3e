// src/dice/SR3ERoll.js
import OpposeRollService from "@services/OpposeRollService.js";

export default class SR3ERoll extends Roll {
   constructor(formula, data = {}, options = {}) {
      super(formula, data, options);
      this.actor = data?.actor || null;
   }

   static create(formula, data = {}, options = {}) {
      return new this(formula, data, options);
   }

   static buildFormula(dice, { explodes = true, targetNumber } = {}) {
      if (dice <= 0) {
         throw new Error(`Invalid dice value: ${dice}`);
      }

      const base = `${dice}d6`;
      const mod = explodes ? (targetNumber != null ? `x${targetNumber}` : `x`) : "";

      return `${base}${mod}`;
   }

   async evaluate(options = {}) {
      await super.evaluate(options);

      const actor = this.actor || ChatMessage.getSpeakerActor(this.options.speaker);

      // ---------------------------------------------
      // ✅ Phase B: Defender response to open contest
      // ---------------------------------------------
      const contest = actor && OpposeRollService.getContestForTarget(actor);
      if (contest && !contest.isResolved) {
         console.log(`[SR3ERoll] Defender ${actor.name} responding to contest ${contest.id}`);

         game.socket.emit("system.sr3e", {
            action: "resolveOpposedRoll",
            data: {
               contestId: contest.id,
               rollData: this.toJSON(),
            },
         });

         // ✅ Track contest for waitForResolution
         this._contested = true;
         this._waitingOn = contest.id;

         return this;
      }

      // ---------------------------------------------
      // ✅ Phase A: Initiator starts opposed rolls
      // ---------------------------------------------
      const rawTargets = Array.from(game.user.targets)
         .map((t) => t.actor)
         .filter(Boolean);

      const uniqueTargets = [...new Map(rawTargets.map((a) => [a.id, a])).values()];

      if (actor && uniqueTargets.length > 0) {
         const isSilent = canvas.tokens.ownedTokens.some((t) => t.actor?.id === actor.id && t.document.hidden);

         // ✅ Track multiple contests
         this._contested = true;
         this._waitingOn = [];

         for (const target of uniqueTargets) {
            console.log(`[SR3ERoll] Initiator ${actor.name} starting contest vs ${target.name}`);
            const contestId = await OpposeRollService.start({
               initiator: actor,
               target,
               rollData: this.toJSON(),
               isSilent,
            });

            if (contestId) this._waitingOn.push(contestId);
         }

         return this;
      }

      // ---------------------------------------------
      // ✅ Phase: Normal non-contested roll
      // ---------------------------------------------
      await this.toMessage();
      return this;
   }

   async toMessage() {
      const flavor = this.getFlavor();
      return ChatMessage.create({ content: await this.render(), speaker: ChatMessage.getSpeaker(), flavor });
   }

   async waitForResolution() {
      if (!this._contested || !this._waitingOn) return;

      // Defender: waiting on a single contest
      if (typeof this._waitingOn === "string") {
         const contestId = this._waitingOn;

         await new Promise((resolve) => {
            const i = setInterval(() => {
               if (!OpposeRollService.getContestById(contestId)) {
                  clearInterval(i);
                  resolve();
               }
            }, 250);
         });
         return;
      }

      // Initiator: waiting on multiple contests
      if (Array.isArray(this._waitingOn)) {
         await new Promise((resolve) => {
            const i = setInterval(() => {
               const unresolved = this._waitingOn.filter((id) => OpposeRollService.getContestById(id));
               if (unresolved.length === 0) {
                  clearInterval(i);
                  resolve();
               }
            }, 250);
         });
         return;
      }
   }

   getFlavor() {
      const parts = [];
      if (this.options.attributeName) parts.push(game.i18n.localize(`sr3e.attributes.${this.options.attributeName}`));
      if (this.options.skillName) parts.push(this.options.skillName);
      if (this.options.specializationName) parts.push(`(${this.options.specializationName})`);
      return parts.join(" ") || "SR3E Roll";
   }

   static Register() {
      CONFIG.Dice.rolls = [SR3ERoll];
      window.Roll = SR3ERoll;
   }
}
