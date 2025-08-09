// src/actors/SR3EActor.js
import { get } from "svelte/store";
import SR3ERoll from "@documents/SR3ERoll.js";
import { StoreManager } from "@sveltehelpers/StoreManager.svelte";

export default class SR3EActor extends Actor {
   async InitiativeRoll() {
      const mgr = StoreManager.Subscribe(this);
      let dice = 1,
         react = 0;

      try {
         const initStore = mgr.GetSumROStore("attributes.initiative");
         const reactStore = mgr.GetSumROStore("attributes.reaction");
         dice = Math.max(1, Number(get(initStore)?.sum ?? 1));
         react = Number(get(reactStore)?.sum ?? 0);
      } finally {
         StoreManager.Unsubscribe(this);
      }

      // 👇 force the core Foundry roll class, not SR3ERoll
      const CoreRoll = foundry.dice.Roll;
      const roll = await new CoreRoll(`${dice}d6 + ${react}`).evaluate();

      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: this }),
         flavor: `${game.i18n?.localize?.("sr3e.initiative") ?? "Initiative"} (${dice}d6 + ${react})`,
         content: `
      <div class="dice-roll">
        <div class="dice-result">
          <div class="dice-formula">${dice}d6 + ${react}</div>
          <h4 class="dice-total">${roll.total}</h4>
        </div>
      </div>`,
      });

      return roll.total;
   }

   async AttributeRoll(dice, attributeName, options = { modifiers: 0, explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, attributeName });
      await roll.evaluate();
   }

   async SkillRoll(dice, skillName, options = { modifiers: 0, explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, skillName });
      await roll.evaluate();
   }

   async SpecializationRoll(dice, specializationName, skillName, options = { explodes: true }) {
      const formula = SR3ERoll.buildFormula(dice, options);
      const roll = new SR3ERoll(formula, null, { ...options, specializationName, skillName });
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

   async commitRollComposerEffects({ karmaCost = 0, poolName = null, poolCost = 0 }) {
      const isInCombat = game.combat !== null;

      const effects = [];

      if (karmaCost > 0) {
         effects.push({
            name: `Karma Drain (${karmaCost})`,
            label: `Used ${karmaCost} Karma Pool`,
            icon: "icons/magic/light/explosion-star-glow-blue.webp",
            changes: [
               {
                  key: "system.karma.karmaPool.mod",
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: `-${karmaCost}`,
                  priority: 1,
               },
            ],
            origin: this.uuid,
            ...(isInCombat && {
               duration: {
                  unit: "rounds",
                  value: 1,
                  startRound: game.combat.round,
                  startTurn: game.combat.turn,
               },
            }),
            flags: {
               sr3e: {
                  temporaryKarmaPoolDrain: true,
                  expiresOutsideCombat: !isInCombat,
               },
            },
         });
      }

      if (poolCost > 0 && poolName) {
         effects.push({
            name: `Dice Pool Drain (${poolName})`,
            label: `Used ${poolCost} from ${poolName}`,
            icon: "systems/sr3e/textures/ai/icons/dicepool.webp",
            changes: [
               {
                  key: `system.dicePools.${poolName}.mod`,
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: `-${poolCost}`,
                  priority: 1,
               },
            ],
            origin: this.uuid,
            transfer: false,
            ...(isInCombat && {
               duration: {
                  unit: "rounds",
                  value: 1,
                  startRound: game.combat.round,
                  startTurn: game.combat.turn,
               },
            }),
            flags: {
               sr3e: {
                  temporaryDicePoolDrain: true,
                  expiresOutsideCombat: !isInCombat,
               },
            },
         });
      }

      if (effects.length > 0) {
         await this.createEmbeddedDocuments("ActiveEffect", effects, { render: false });
      }
   }

   static Register() {
      CONFIG.Actor.documentClass = SR3EActor;
      console.log("sr3e /// ---> SR3EActor registered");
   }
}
