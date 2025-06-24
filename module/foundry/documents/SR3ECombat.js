// SR3ECombat.js
export default class SR3ECombat extends foundry.documents.Combat {
  // 1. Roll custom initiative
  async rollInitiative(ids, options = {}) {
    ids = Array.isArray(ids) ? ids : [ids];
    for (const cid of ids) {
      const combatant = this.combatants.get(cid);
      if (!combatant) throw new Error(`Invalid Combatant ID: ${cid}`);
      const actor = combatant.actor;
      if (actor?.rollInitiative) {
        const initValue = await actor.rollInitiative(options);
        if (typeof initValue === 'number') {
          await this.setInitiative(cid, initValue);
        }
      } else {
        await super.rollInitiative([cid], options);
      }
    }
  }

  // 2. Called at the very start of each Combat Turn
  async _onUpdate(data, options, userId) {
    await super._onUpdate(data, options, userId);
    if (data.round != null) {
      // reset pass counter & refresh pools
      await this.setFlag("sr3e", "pass", 1);
      await this.refreshAllDicePools();
    }
  }

  // 3. Refresh each actor's dice pools once per Combat Turn
  async refreshAllDicePools() {
    for (const c of this.combatants) {
      const actor = c.actor;
      if (actor?.refreshDicePools) {
        await actor.refreshDicePools();
      }
    }
  }

  // 4. Called at the beginning of each combatant's turn
  async _onStartTurn(combatant, context = {}) {
    await super._onStartTurn(combatant, context);

    let pass = this.getFlag("sr3e", "pass") || 1;
    const turnId = combatant.id;

    // after first pass, drop 10 from initiative before each new pass
    if (context.passStart && pass > 1) {
      const newInit = combatant.initiative - 10;
      await this.setInitiative(turnId, newInit);
    }

    // check if this turn ended the entire pass
    if (this._isEndOfPass(turnId)) {
      await this.advancePassOrTurn();
    }
  }

  _isEndOfPass(currentCombatantId) {
    const maxInit = Math.max(
      ...this.combatants.map(c => c.initiative)
    );
    const lastId = this.turns[this.turns.length - 1].id;
    return currentCombatantId === lastId && maxInit > 0;
  }

  // 5. Advance to next pass or next round
  async advancePassOrTurn() {
    let pass = this.getFlag("sr3e", "pass") || 1;
    pass++;
    await this.setFlag("sr3e", "pass", pass);

    if (this.combatants.some(c => c.initiative > 0)) {
      // same round, new pass
      ui.notifications.info(`Starting initiative pass ${pass}`);
      await this.setupTurns(); // re-sort based on updated initiatives
      await this.nextTurn();  // jump into next
    } else {
      // everything's 0 or less → new round
      await this.nextRound();
    }
  }
}
