export default class SR3ECombat extends foundry.documents.Combat {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/shadowrun3e/templates/combat/combat-tracker.html",
      classes: ["shadowrun3e", "combat-tracker"],
    });
  }

  /** @override */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      label: "SR3E.Combat",
      collection: "combats",
      embedded: {},
      compendiumBanner: "systems/shadowrun3e/assets/combat-banner.jpg",
    });
  }

  /* -------------------------------------------- */
  /*  Combat Properties                           */
  /* -------------------------------------------- */

  /**
   * Get the current initiative pass number (1-based)
   */
  get currentPass() {
    return this.getFlag("shadowrun3e", "currentPass") || 1;
  }

  /**
   * Set the current initiative pass
   */
  async setCurrentPass(pass) {
    return this.setFlag("shadowrun3e", "currentPass", pass);
  }

  /**
   * Get dice pools state for the current turn
   */
  get dicePools() {
    return this.getFlag("shadowrun3e", "dicePools") || {};
  }

  /**
   * Set dice pools state
   */
  async setDicePools(pools) {
    return this.setFlag("shadowrun3e", "dicePools", pools);
  }

  /**
   * Check if this is the first initiative pass of the turn
   */
  get isFirstPass() {
    return this.currentPass === 1;
  }

  /* -------------------------------------------- */
  /*  Combat Flow                                 */
  /* -------------------------------------------- */

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Initialize SR3E specific flags
    this.updateSource({
      "flags.shadowrun3e.currentPass": 1,
      "flags.shadowrun3e.dicePools": {},
      "flags.shadowrun3e.turnPhase": "declare", // declare, resolve, next
    });
  }

  /** @override */
  async startCombat() {
    // Refresh all dice pools at start of combat
    await this._refreshDicePools();

    // Roll initiative for all combatants
    await this._rollInitiativeAll();

    return super.startCombat();
  }

  /** @override */
  async nextTurn() {
    // Check if we need to start a new initiative pass
    const currentCombatant = this.combatant;
    if (!currentCombatant) return super.nextTurn();

    // Get next combatant in initiative order
    const nextCombatantIndex = this._getNextCombatantIndex();

    // If we've cycled through all combatants, start next initiative pass
    if (nextCombatantIndex === 0 || nextCombatantIndex === null) {
      return this._nextInitiativePass();
    }

    return super.nextTurn();
  }

  /** @override */
  async nextRound() {
    // In SR3E, rounds are handled differently - we use initiative passes
    // A new "round" is actually a new combat turn with fresh initiative rolls
    await this._startNewCombatTurn();
    return super.nextRound();
  }

  /* -------------------------------------------- */
  /*  Initiative System                           */
  /* -------------------------------------------- */

  /**
   * Roll initiative for all combatants
   */
  async _rollInitiativeAll() {
    const updates = [];

    for (let combatant of this.combatants) {
      const actor = combatant.actor;
      if (!actor) continue;

      const initiative = await this._calculateInitiative(actor);
      updates.push({
        _id: combatant.id,
        initiative: initiative.total,
        "flags.shadowrun3e.initiativeScore": initiative.total,
        "flags.shadowrun3e.initiativeRoll": initiative.roll,
        "flags.shadowrun3e.reactionBase": initiative.reaction,
      });
    }

    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("Combatant", updates);
    }

    // Sort combatants by initiative
    await this._sortCombatants();
  }

  /**
   * Calculate initiative for an actor
   */
  async _calculateInitiative(actor) {
    const actorData = actor.system;

    // Get base reaction (including cyberware/magic modifiers)
    const baseReaction = actorData.attributes?.reaction?.value || 1;
    const reactionMods = actorData.attributes?.reaction?.mod || 0;
    const adjustedReaction = baseReaction + reactionMods;

    // Get initiative dice (base 1d6 + modifiers)
    const baseDice = 1;
    const initiativeDiceMods = actorData.initiative?.diceMod || 0;
    const totalDice = baseDice + initiativeDiceMods;

    // Roll initiative dice (Rule of Six does NOT apply)
    const roll = new Roll(`${totalDice}d6`);
    await roll.roll({ async: true });

    // Calculate total initiative
    const diceTotal = roll.total;
    const initiativeTotal = adjustedReaction + diceTotal;

    // Apply wound modifiers
    const woundMod = this._getWoundModifier(actor);
    const finalTotal = Math.max(0, initiativeTotal + woundMod);

    return {
      total: finalTotal,
      roll: roll,
      reaction: adjustedReaction,
      diceTotal: diceTotal,
      woundMod: woundMod,
    };
  }

  /**
   * Get wound modifier for initiative
   */
  _getWoundModifier(actor) {
    const damage = actor.system.damage;
    if (!damage) return 0;

    // Calculate wound modifier based on damage track
    const physicalWounds = Math.floor(damage.physical / 3);
    const stunWounds = Math.floor(damage.stun / 3);

    return -(physicalWounds + stunWounds);
  }

  /**
   * Start next initiative pass
   */
  async _nextInitiativePass() {
    const nextPass = this.currentPass + 1;

    // Subtract 10 from all combatants' initiative scores
    const updates = [];
    let hasEligibleCombatants = false;

    for (let combatant of this.combatants) {
      const currentInit =
        combatant.getFlag("shadowrun3e", "initiativeScore") || 0;
      const newInit = currentInit - 10;

      updates.push({
        _id: combatant.id,
        initiative: newInit,
        "flags.shadowrun3e.initiativeScore": newInit,
      });

      if (newInit > 0) {
        hasEligibleCombatants = true;
      }
    }

    // If no one can act, start new combat turn
    if (!hasEligibleCombatants) {
      return this._startNewCombatTurn();
    }

    // Update combatants and set new pass
    await this.updateEmbeddedDocuments("Combatant", updates);
    await this.setCurrentPass(nextPass);

    // Resort combatants and reset to first eligible combatant
    await this._sortCombatants();
    await this.update({ turn: 0 });

    // Announce new initiative pass
    ChatMessage.create({
      content: `<h3>Initiative Pass ${nextPass}</h3>`,
      speaker: { alias: "Combat System" },
    });
  }

  /**
   * Start a new combat turn (fresh initiative rolls)
   */
  async _startNewCombatTurn() {
    // Reset to first initiative pass
    await this.setCurrentPass(1);

    // Refresh all dice pools
    await this._refreshDicePools();

    // Roll new initiative for all combatants
    await this._rollInitiativeAll();

    // Reset turn to first combatant
    await this.update({ turn: 0 });

    // Announce new combat turn
    ChatMessage.create({
      content: `<h2>New Combat Turn</h2><p>All dice pools refreshed. New initiative rolled.</p>`,
      speaker: { alias: "Combat System" },
    });
  }

  /**
   * Sort combatants by initiative score
   */
  async _sortCombatants() {
    const sortedCombatants = this.combatants.contents.sort((a, b) => {
      const aInit = a.getFlag("shadowrun3e", "initiativeScore") || 0;
      const bInit = b.getFlag("shadowrun3e", "initiativeScore") || 0;

      if (aInit !== bInit) return bInit - aInit; // Higher initiative first

      // Tie-breaking rules
      return this._resolveInitiativeTie(a, b);
    });

    // Update sort order
    const updates = sortedCombatants.map((combatant, index) => ({
      _id: combatant.id,
      flags: {
        ...combatant.flags,
        core: {
          ...combatant.flags.core,
          sort: index * 100000,
        },
      },
    }));

    await this.updateEmbeddedDocuments("Combatant", updates);
  }

  /**
   * Resolve initiative ties according to SR3E rules
   */
  _resolveInitiativeTie(combatantA, combatantB) {
    // 1. Highest initiative in first pass
    const aFirstPass = combatantA.getFlag("shadowrun3e", "firstPassInit") || 0;
    const bFirstPass = combatantB.getFlag("shadowrun3e", "firstPassInit") || 0;
    if (aFirstPass !== bFirstPass) return bFirstPass - aFirstPass;

    // 2. Highest adjusted reaction
    const aReaction = combatantA.getFlag("shadowrun3e", "reactionBase") || 0;
    const bReaction = combatantB.getFlag("shadowrun3e", "reactionBase") || 0;
    if (aReaction !== bReaction) return bReaction - aReaction;

    // 3. Highest unaugmented reaction
    const aUnaugReaction =
      combatantA.actor?.system.attributes?.reaction?.base || 0;
    const bUnaugReaction =
      combatantB.actor?.system.attributes?.reaction?.base || 0;
    if (aUnaugReaction !== bUnaugReaction)
      return bUnaugReaction - aUnaugReaction;

    // 4. Random (simulated with actor ID for consistency)
    return combatantA.actor?.id.localeCompare(combatantB.actor?.id) || 0;
  }

  /* -------------------------------------------- */
  /*  Dice Pool Management                        */
  /* -------------------------------------------- */

  /**
   * Refresh all dice pools at start of combat turn
   */
  async _refreshDicePools() {
    const pools = {};

    for (let combatant of this.combatants) {
      const actor = combatant.actor;
      if (!actor) continue;

      const actorPools = this._getActorDicePools(actor);
      pools[combatant.id] = actorPools;
    }

    await this.setDicePools(pools);
  }

  /**
   * Get dice pools for an actor
   */
  _getActorDicePools(actor) {
    const system = actor.system;

    return {
      combat: system.pools?.combat || 0,
      control: system.pools?.control || 0,
      hacking: system.pools?.hacking || 0,
      spell: system.pools?.spell || 0,
      astral: system.pools?.astral || 0,
      // Karma pool refreshes on different schedule
      karma: system.pools?.karma || 0,
    };
  }

  /**
   * Spend dice from a pool
   */
  async spendDicePool(combatantId, poolType, amount) {
    const currentPools = this.dicePools;
    const combatantPools = currentPools[combatantId];

    if (!combatantPools || combatantPools[poolType] < amount) {
      ui.notifications.warn(`Not enough ${poolType} dice available.`);
      return false;
    }

    combatantPools[poolType] -= amount;
    currentPools[combatantId] = combatantPools;

    await this.setDicePools(currentPools);
    return true;
  }

  /* -------------------------------------------- */
  /*  Action Management                           */
  /* -------------------------------------------- */

  /**
   * Action types and their properties
   */
  static get ACTION_TYPES() {
    return {
      COMPLEX: {
        name: "Complex",
        limit: 1,
        examples: [
          "Astral Projection",
          "Casting a Spell",
          "Firing Automatic Weapon",
          "Melee/Unarmed Attack",
          "Reloading (non-clip)",
          "Using Complex Object",
          "Drone Commands",
          "Matrix Operations",
        ],
      },
      SIMPLE: {
        name: "Simple",
        limit: 2,
        examples: [
          "Activating Focus",
          "Changing Gun Mode",
          "Firing Firearm",
          "Insert/Remove Clip",
          "Perception Test",
          "Quick Draw",
          "Ready Weapon",
          "Shift Perception",
          "Take Aim",
          "Throw Weapon",
        ],
      },
      FREE: {
        name: "Free",
        limit: 1,
        timing: "any_phase",
        examples: [
          "Activate Cyberware",
          "Call Shot",
          "Change Smartgun Mode",
          "Deactivate Focus",
          "Delay Action",
          "Drop Prone",
          "Gesture",
          "Speak",
          "Allocate Spell Defense",
          "Jack Out",
        ],
      },
    };
  }

  /**
   * Track actions taken by combatants
   */
  async recordAction(combatantId, actionType, actionName) {
    const combatant = this.combatants.get(combatantId);
    if (!combatant) return;

    const currentActions = combatant.getFlag(
      "shadowrun3e",
      "currentActions"
    ) || {
      complex: 0,
      simple: 0,
      free: 0,
    };

    const actionTypes = this.constructor.ACTION_TYPES;
    const typeData = actionTypes[actionType.toUpperCase()];

    if (!typeData) {
      ui.notifications.error(`Invalid action type: ${actionType}`);
      return;
    }

    // Check if action is allowed
    if (currentActions[actionType.toLowerCase()] >= typeData.limit) {
      ui.notifications.warn(
        `Cannot take more ${typeData.name} actions this phase.`
      );
      return;
    }

    // Record the action
    currentActions[actionType.toLowerCase()]++;

    await combatant.setFlag("shadowrun3e", "currentActions", currentActions);

    // Create chat message for action
    ChatMessage.create({
      content: `<strong>${combatant.name}</strong> takes ${typeData.name} Action: ${actionName}`,
      speaker: { alias: combatant.name },
    });
  }

  /**
   * Reset actions for a combatant's new phase
   */
  async resetCombatantActions(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (!combatant) return;

    await combatant.setFlag("shadowrun3e", "currentActions", {
      complex: 0,
      simple: 0,
      free: 0,
    });
  }

  /* -------------------------------------------- */
  /*  Combat Phase Management                     */
  /* -------------------------------------------- */

  /**
   * Get next combatant index who can still act
   */
  _getNextCombatantIndex() {
    const currentIndex = this.turn;
    const totalCombatants = this.combatants.size;

    for (let i = 1; i < totalCombatants; i++) {
      const nextIndex = (currentIndex + i) % totalCombatants;
      const combatant = this.combatants.contents[nextIndex];

      if (this._canCombatantAct(combatant)) {
        return nextIndex;
      }
    }

    return null; // No more combatants can act
  }

  /**
   * Check if a combatant can act in current initiative pass
   */
  _canCombatantAct(combatant) {
    const initiativeScore =
      combatant.getFlag("shadowrun3e", "initiativeScore") || 0;
    return initiativeScore > 0;
  }

  /* -------------------------------------------- */
  /*  Special Combat Situations                   */
  /* -------------------------------------------- */

  /**
   * Handle delayed actions
   */
  async handleDelayedAction(combatantId, targetPhase) {
    const combatant = this.combatants.get(combatantId);
    if (!combatant) return;

    // Mark as delayed
    await combatant.setFlag("shadowrun3e", "delayedAction", {
      originalPhase: this.turn,
      targetPhase: targetPhase,
      canIntervene: true,
    });

    ChatMessage.create({
      content: `<strong>${combatant.name}</strong> delays their action.`,
      speaker: { alias: combatant.name },
    });
  }

  /**
   * Handle intervention from delayed action
   */
  async handleIntervention(combatantId) {
    const combatant = this.combatants.get(combatantId);
    if (!combatant) return;

    const delayedAction = combatant.getFlag("shadowrun3e", "delayedAction");
    if (!delayedAction?.canIntervene) {
      ui.notifications.warn("Cannot intervene at this time.");
      return;
    }

    // Clear delayed action flag
    await combatant.unsetFlag("shadowrun3e", "delayedAction");

    // Reset their actions for this intervention
    await this.resetCombatantActions(combatantId);

    ChatMessage.create({
      content: `<strong>${combatant.name}</strong> intervenes with their delayed action!`,
      speaker: { alias: combatant.name },
    });
  }

  /* -------------------------------------------- */
  /*  Vehicle Combat Extensions                   */
  /* -------------------------------------------- */

  /**
   * Handle vehicle combat special rules
   */
  async _handleVehicleCombat() {
    // Vehicle combat has additional phases for:
    // - Determining vehicle/terrain/speed points
    // - Allocating Control Pool dice
    // - Determining speed/distance/terrain changes

    // Passengers cannot act before rigger in first pass
    if (this.isFirstPass) {
      await this._enforceVehiclePassengerRules();
    }
  }

  /**
   * Enforce vehicle passenger action restrictions
   */
  async _enforceVehiclePassengerRules() {
    // This would need to be implemented based on vehicle data structure
    // For now, just a placeholder for the concept
  }

  /* -------------------------------------------- */
  /*  Utility Methods                             */
  /* -------------------------------------------- */

  /**
   * Get combatant's current initiative score
   */
  getCombatantInitiative(combatantId) {
    const combatant = this.combatants.get(combatantId);
    return combatant?.getFlag("shadowrun3e", "initiativeScore") || 0;
  }

  /**
   * Get available dice pools for combatant
   */
  getCombatantDicePools(combatantId) {
    const allPools = this.dicePools;
    return allPools[combatantId] || {};
  }

  /**
   * Export combat state for debugging
   */
  exportCombatState() {
    return {
      currentPass: this.currentPass,
      currentTurn: this.turn,
      combatants: this.combatants.map((c) => ({
        name: c.name,
        initiative: c.getFlag("shadowrun3e", "initiativeScore"),
        actions: c.getFlag("shadowrun3e", "currentActions"),
      })),
      dicePools: this.dicePools,
    };
  }
}
