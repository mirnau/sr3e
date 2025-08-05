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
      if (dice <= 0) return "1d6";

      const base = `${dice}d6`;
      const mod = explodes ? (targetNumber != null ? `x${targetNumber}` : `x`) : "";

      return `${base}${mod}`;
   }

   async evaluate(options = {}) {
      this.options = foundry.utils.mergeObject(this.options ?? {}, options ?? {});
      await super.evaluate(options);

      const actor = this.actor || ChatMessage.getSpeakerActor(this.options.speaker);

      // Check if this is an opposed roll (initiator)
      if (this.options.opposed && actor) {
         const targets = Array.from(game.user.targets)
            .map((t) => t.actor)
            .filter(Boolean);

         const uniqueTargets = [...new Map(targets.map((a) => [a.id, a])).values()];

         if (uniqueTargets.length > 0) {
            this._contested = true;
            this._waitingOn = [];

            for (const target of uniqueTargets) {
               console.log(`[SR3ERoll] Initiator ${actor.name} starting contest vs ${target.name}`);
               const contestId = await OpposeRollService.start({
                  initiator: actor,
                  target,
                  rollData: this.toJSON(),
                  options: this.options,
               });

               if (contestId) this._waitingOn.push(contestId);
            }

            return this;
         }
      }

      // Normal non-contested roll
      await this.toMessage();
      return this;
   }

   async toMessage() {
      const flavor = this.getFlavor();
      return ChatMessage.create({
         content: await this.render(),
         speaker: ChatMessage.getSpeaker(),
         flavor,
      });
   }

   async waitForResolution() {
      if (!this._contested || !this._waitingOn) return;

      // Defender: waiting on a single contest
      if (typeof this._waitingOn === "string") {
         const contestId = this._waitingOn;

         await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
               if (!OpposeRollService.getContestById(contestId)) {
                  clearInterval(checkInterval);
                  resolve();
               }
            }, 250);
         });
         return;
      }

      // Initiator: waiting on multiple contests
      if (Array.isArray(this._waitingOn)) {
         await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
               const unresolved = this._waitingOn.filter((id) => OpposeRollService.getContestById(id));
               if (unresolved.length === 0) {
                  clearInterval(checkInterval);
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
