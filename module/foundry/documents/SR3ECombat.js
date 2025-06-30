import * as CombatService from "./../../services/CombatService.js";

export default class SR3ECombat extends foundry.documents.Combat {
  async startCombat() {
    CombatService.Print("Combat Started");
    await this._refreshDicePools();
  }

  _refreshDicePools() {
    for (const combatant of this.combatants) {
      const actor = combatant.actor;
      if (!actor) continue;
      
      const dicePool = actor.getWoundModifier();
    }
  }

  nextTurn() {
    throw new NotImplementedError("nextInitiativePass");
  }
  nextRound() {
    throw new NotImplementedError("nextInitiativePass");
  }
  #nextInitiativePass() {
    throw new NotImplementedError("nextInitiativePass");
  }

  #startNewCombatTurn() {
    throw new NotImplementedError("startNewCombatTurn");
  }

  #recordAction() {
    throw new NotImplementedError("recordAction");
  }
  #resetCombatantActions() {
    throw new NotImplementedError("resetCombatantActions");
  }

  #handleDelayedAction() {
    throw new NotImplementedError("handleDelayedAction");
  }

  #handleIntervention() {
    throw new NotImplementedError("handleIntervention");
  }

  static Register() {
    CONFIG.Combat.documentClass = SR3ECombat;
  }
}
