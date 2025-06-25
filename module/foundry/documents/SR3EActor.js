import { get } from "svelte/store";
import { writable } from "svelte/store";

export default class SR3EActor extends Actor {
  #documentStore = {};

/**
 * Creates or retrieves a reactive Svelte store for a given data path within the actor's system data.
 * The store is initialized with the current value at the specified path and updates both the system data
 * and the underlying document when its value changes.
 *
 * @param {string} dataPath - The dot-separated path within the actor's system data to bind to the store.
 * @returns {import('svelte/store').Writable<any>} A Svelte writable store bound to the specified data path.
 * @throws {Error} If the store cannot be created or the data path is invalid.
 */
getStore(dataPath) {
  try {
    const fullPath = `system.${dataPath}`;

    if (!this.#documentStore[dataPath]) {
      let value = foundry.utils.getProperty(this.system, dataPath);

      if (value && typeof value === "object") {
        value = Array.isArray(value) ? [...value] : { ...value };
      }

      const store = writable(value);

      store.subscribe((newValue) => {
        foundry.utils.setProperty(this.system, dataPath, newValue);
        this.update({ [fullPath]: newValue }, { render: false });
      });

      this.#documentStore[dataPath] = store;
    }

    return this.#documentStore[dataPath];
  } catch (err) {
    console.error(`Failed to create reactive store for "system.${dataPath}"`, err);
    throw err;
  }
}

_onDelete() {
    super._onDelete();
    
    // Clean up store subscriptions
    for (const store of Object.values(this.#documentStore)) {
      if (store._unsubscribe) {
        store._unsubscribe();
      }
    }
    
    this.#documentStore = {};
  }


  get getInitiativeDice() {
    let dice = 1;
    // Get all bioware
    // Get all cybeware
    // Spell effects
    // Adept powers
    console.warn(
      "SR3EActor.getInitiativeDice is not implemented. Returning 1 by default."
    );
    return dice;
  }

  get AugumentedReaction() {
    let augmentedReaction = 0;
    // Get all bioware
    // Get all cybeware
    // Spell effects
    // Adept powers
    console.warn(
      "SR3EActor.getAugmentedReaction is not implemented. Returning 0 by default."
    );
    return augmentedReaction;
  }

  async rollInitiative(options = {}) {
    const initiativeDice = get(
      getActorStore(this.id, stores.initiativeDice, 1)
    );
    const augmentedReaction = get(
      getActorStore(this.id, stores.augmentedReaction)
    );

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
      const combatant = game.combat.combatants.find(
        (c) => c.actor.id === this.id
      );
      if (combatant) {
        await game.combat.setInitiative(combatant.id, totalInit);
      }
    }

    return totalInit; // Return the total value, not the roll object
  }

  async canAcceptMetahuman(incomingItem) {
    const existing = this.items.filter((i) => i.type === "metahuman");

    if (existing.length > 1) {
      const [oldest, ...rest] = existing.sort((a, b) =>
        a.id.localeCompare(b.id)
      );
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
