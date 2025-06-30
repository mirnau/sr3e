import { get } from "svelte/store";
import RollService from "../../services/RollService.js";
export default class SR3EActor extends Actor {
   get getInitiativeDice() {
      let dice = 1;
      // Get all bioware
      // Get all cybeware
      // Spell effects
      // Adept powers
      console.warn("SR3EActor.getInitiativeDice is not implemented. Returning 1 by default.");
      return dice;
   }

   get AugumentedReaction() {
      let augmentedReaction = 0;
      // Get all bioware
      // Get all cybeware
      // Spell effects
      // Adept powers
      console.warn("SR3EActor.getAugmentedReaction is not implemented. Returning 0 by default.");
      return augmentedReaction;
   }

   async InitiativeRoll(dice, options) {
      await RollService.Initiative(this, dice, options);
   }

   async AttributeRoll(dice, attributeName, options = { targetNumber: -1, explodes: true }) {
      await RollService.AttributeRoll(this, attributeName, dice, options);
   }

   async canAcceptmetatype(incomingItem) {
      const existing = this.items.filter((i) => i.type === "metatype");

      if (existing.length > 1) {
         const [oldest, ...rest] = existing.sort((a, b) => a.id.localeCompare(b.id));
         const toDelete = rest.map((i) => i.id);
         await this.deleteEmbeddedDocuments("Item", toDelete);
      }

      const current = this.items.find((i) => i.type === "metatype");
      if (!current) return "accept";

      const incomingName = incomingItem.name.toLowerCase();
      const currentName = current.name.toLowerCase();

      const isIncomingHuman = incomingName === "human";
      const isCurrentHuman = currentName === "human";

      if (isCurrentHuman && !isIncomingHuman) return "goblinize";
      if (!isCurrentHuman && isIncomingHuman) return "reject";
      if (incomingName === currentName) return "reject";

      return "reject";
   }

   async replacemetatype(newItem) {
      const current = this.items.find((i) => i.type === "metatype");
      if (current) await this.deleteEmbeddedDocuments("Item", [current.id]);

      await this.createEmbeddedDocuments("Item", [newItem.toObject()]);
      await this.update({
         "system.profile.metaType": newItem.name,
         "system.profile.img": newItem.img,
      });
   }

   static Register() {
      CONFIG.Actor.documentClass = SR3EActor;
   }
}
