import * as CombatService from "@services/CombatService.js";

export default class SR3ECombat extends foundry.documents.Combat {
   async startCombat() {
      CombatService.Print("=== COMBAT STARTED ===");
      await this.setFlag("sr3e", "combatTurn", 1);
      await this.setFlag("sr3e", "initiativePass", 1);
      return super.startCombat();
   }

   async rollInitiative(ids, { createCombatants = false, updateTurn = true } = {}) {
      const updates = [];

      for (let id of ids) {
         const combatant = this.combatants.get(id);
         if (!combatant || !combatant.actor) continue;

         const totalInit = await combatant.actor.InitiativeRoll();
         updates.push({ _id: id, initiative: totalInit });
      }

      if (updates.length > 0) {
         await this.updateEmbeddedDocuments("Combatant", updates);
      }

      if (updateTurn) await this.update({ turn: 0 });

      return this;
   }

   async nextTurn() {
      const result = await super.nextTurn();
      const combatant = this.combatant;

      if (!combatant) return result;

      if (combatant.initiative < 1) {
         await this._advanceInitiativePass();
      } else {
         CombatService.Print(`-> ${combatant.name} acts (Init: ${combatant.initiative})`);
      }

      return result;
   }

   async _advanceInitiativePass() {
      const currentPass = this.getFlag("sr3e", "initiativePass") || 1;
      CombatService.Print(`--- Ending Initiative Pass ${currentPass} ---`);

      for (const c of this.combatants.contents) {
         if (c.initiative > 0) {
            const newInit = Math.max(0, c.initiative - 10);
            await c.update({ initiative: newInit });
         }
      }

      const stillActive = this.combatants.contents.some((c) => c.initiative > 0);

      if (stillActive) {
         const newPass = currentPass + 1;
         CombatService.Print(`--- New Initiative Pass ${newPass} ---`);
         await this.setFlag("sr3e", "initiativePass", newPass);
         await this.update({ turn: 0 });
      } else {
         CombatService.Print("— All Initiative Passes Completed — Proceeding to next round —");
         await this.nextRound();
      }
   }

   async nextRound() {
      const initiativePass = this.getFlag("sr3e", "initiativePass") || 1;
      const hasPositive = this.combatants.contents.some((c) => c.initiative > 0);

      if (hasPositive && initiativePass > 0) {
         return await this._advanceInitiativePass();
      } else {
         const round = this.round + 1;
         game.time.advance(3);
         CombatService.Print(`=== STARTING COMBAT TURN ${round} ===`);
         await this.setFlag("sr3e", "combatTurn", round);
         await this.setFlag("sr3e", "initiativePass", 1);
         await this.resetAll({ updateTurn: false });
         return super.nextRound();
      }
   }

   static Register() {
      CONFIG.Combat.documentClass = SR3ECombat;
   }
}
