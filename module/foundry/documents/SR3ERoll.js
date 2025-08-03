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

   static buildFormula(dice, { explodes = true, targetNumber = 4 } = {}) {
      const parsedDice = Number(dice);
      if (!Number.isFinite(parsedDice) || parsedDice <= 0) {
         throw new Error(`Invalid dice value: ${dice}`);
      }
      const base = `${parsedDice}d6`;
      const mod = explodes ? `x${targetNumber}` : "";
      return `${base}${mod}`;
   }

   async evaluate(options = {}) {
      await super.evaluate(options);

      const actor = this.actor || ChatMessage.getSpeakerActor(this.options.speaker);
      const targets = Array.from(game.user.targets).map(t => t.actor).filter(Boolean);

      // Centralized detection of opposed rolls
      if (actor && targets.length > 0) {
         const isSilent = canvas.tokens.ownedTokens.find(t => t.actor?.id === actor.id)?.document?.hidden ?? false;

         for (const target of targets) {
            await OpposeRollService.start({
               initiator: actor,
               target,
               rollData: this.toJSON(),
               isSilent
            });
         }

         return this;
      }

      await this.toMessage();
      return this;
   }

   async toMessage() {
      const flavor = this.getFlavor();
      return ChatMessage.create({ content: await this.render(), speaker: ChatMessage.getSpeaker(), flavor });
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
