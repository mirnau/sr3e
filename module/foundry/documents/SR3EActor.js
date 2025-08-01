// src/actors/SR3EActor.js
import { get } from "svelte/store";
import SR3ERoll from "@documents/SR3ERoll.js";

export default class SR3EActor extends Actor {
   async InitiativeRoll() {
      const formula = SR3ERoll.buildFormula(this.system.attributes.quickness.value, { targetNumber: 4 });
      const roll = new SR3ERoll(formula, null, { attributeName: "quickness" });
      await roll.evaluate();
   }

   async AttributeRoll(dice, attributeName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, attributeName });
      await roll.evaluate();
   }

   async SkillRoll(dice, skillName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, skillName });
      await roll.evaluate();
   }

   async SpecializationRoll(dice, specializationName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, specializationName });
      await roll.evaluate();
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
      console.log("sr3e /// ---> SR3EActor registered");
   }
}
