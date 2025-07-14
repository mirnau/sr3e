import { get } from "svelte/store";
import { StoreManager } from "../svelte/svelteHelpers/StoreManager.svelte";

export default class RollService {
   static async AttributeRoll(
      actor,
      attributeName,
      dice, // the value to be rolled
      options = {
         targetNumber: 0, //Target number 0 is forbidden in shadowrun, so we can know that thw roll has no target if target < 2
         explodes: true,
         defaulted: false,
         modifiers: 0,
      }
   ) {
      let formula = "";
      if (options.explodes) {
         formula = `${dice}d6x`;

         if (options.targetNumber && options.targetNumber > 1) {
            formula += (options.targetNumber + options.modifiers).toString();
         }
      } else {
         formula = `${dice}d6`;
      }

      const roll = new Roll(formula);
      await roll.evaluate();

      const term = roll.terms.find((t) => t instanceof foundry.dice.terms.Die);
      const isSR3 = term instanceof CONFIG.Dice.terms["d"];

      let resultSummary = "";
      if (isSR3 && typeof term.successes === "number") {
         if (term.successes > 0) {
            resultSummary = `${term.successes} success${term.successes > 1 ? "es" : ""}`;
         } else if (term.isBotch) {
            resultSummary = `Oopsie! Disastrous mistake! ${term.ones} ones and no successes.`;
         } else {
            resultSummary = "No successes.";
         }
      }

      let flavor = "";

      if (options.defaulted) {
         flavor = `${actor.name} rolls a skill default on linked attribute ${attributeName} (${formula})${
            resultSummary ? `<br>${resultSummary}` : ""
         }`;
      } else if (options.modifier > 0) {
         flavor = `${actor.name} rolls ${attributeName} (${formula}) with ${options.modifiers} modifier${
            resultSummary ? `<br>${resultSummary}` : ""
         }`;
      } else {
         flavor = `${actor.name} rolls ${attributeName} (${formula})${resultSummary ? `<br>${resultSummary}` : ""}`;
      }

      await roll.toMessage({
         speaker: ChatMessage.getSpeaker({ actor: actor }),
         flavor,
         rollMode: options.rollMode ?? game.settings.get("core", "rollMode"),
      });
   }

   static async SkillRoll(actor, skillName, dice, options) {
      console.log("[SkillRoll]", {
         skillName,
         dice,
         options,
      });
   }

   static async SpecializationRoll(actor, skillName, dice, options) {
      console.log("[SpecializationRoll]", {
         skillName,
         dice,
         options,
      });
   }

   static async Initiaitve(actor) {

      const storeManager = StoreManager.Subscribe(actor);
      const initiativeDiceStore = storeManager.GetSumROStore("attributes.initiative");
      const reactionStore = storeManager.GetSumROStore("attributes.reaction");
      const initiativeDice = get(initiativeDiceStore).sum;
      const reaction = get(reactionStore).sum;
      StoreManager.Unsubscribe(actor);

      const roll = await new Roll(`${initiativeDice}d6`).evaluate();
      const totalInit = roll.total + reaction;

      await roll.toMessage({
         speaker: ChatMessage.getSpeaker({ actor: actor }),
         flavor: `${actor.name} rolls Initiative: ${initiativeDice}d6 + ${reaction}`,
      });

      if (actor.combatant) {
         await actor.combatant.update({ initiative: totalInit });
      } else if (game.combat) {
         const combatant = game.combat.combatants.find((c) => c.actor.id === actor.id);
         if (combatant) {
            await game.combat.setInitiative(combatant.id, totalInit);
         }
      }

      return totalInit;
   }
}
