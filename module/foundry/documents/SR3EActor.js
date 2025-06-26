import { get } from "svelte/store";
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

   async rollInitiative(options = {}) {
      const initiativeDice = get(getActorStore(this.id, stores.initiativeDice, 1));
      const augmentedReaction = get(getActorStore(this.id, stores.augmentedReaction));

      const roll = await new Roll(`${initiativeDice}d6`).evaluate();
      const totalInit = roll.total + augmentedReaction;

      // Show the roll in chat
      await roll.toMessage({
         speaker: ChatMessage.getSpeaker({ actor: this }),
         flavor: `${this.name} rolls Initiative: ${initiativeDice}d6 + ${augmentedReaction}`,
      });

      if (this.combatant) {
         // If we have a direct combatant reference, update it
         await this.combatant.update({ initiative: totalInit });
      } else if (game.combat) {
         // Find our combatant and update directly - NO rollInitiative call
         const combatant = game.combat.combatants.find((c) => c.actor.id === this.id);
         if (combatant) {
            await game.combat.setInitiative(combatant.id, totalInit);
         }
      }

      return totalInit; // Return the total value, not the roll object
   }

   async canAcceptMetahuman(incomingItem) {
      const existing = this.items.filter((i) => i.type === "metahuman");

      if (existing.length > 1) {
         const [oldest, ...rest] = existing.sort((a, b) => a.id.localeCompare(b.id));
         const toDelete = rest.map((i) => i.id);
         await this.deleteEmbeddedDocuments("Item", toDelete);
      }

      const current = this.items.find((i) => i.type === "metahuman");
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

   async replaceMetahuman(newItem) {
      const current = this.items.find((i) => i.type === "metahuman");
      if (current) await this.deleteEmbeddedDocuments("Item", [current.id]);

      await this.createEmbeddedDocuments("Item", [newItem.toObject()]);
      await this.update({
         "system.profile.metaHumanity": newItem.name,
         "system.profile.img": newItem.img,
      });
   }
}
