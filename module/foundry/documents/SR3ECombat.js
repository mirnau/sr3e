export default class SR3ECombat extends foundry.documents.Combat {
  /**
   * Override rollInitiative to call Actor.rollInitiative globally
   */
  async rollInitiative(ids, options = {}) {
    ids = Array.isArray(ids) ? ids : [ids];
    
    for (const cid of ids) {
      const combatant = this.combatants.get(cid);
      if (!combatant) throw new Error(`Invalid Combatant ID: ${cid}`);
      
      const actor = combatant.actor;
      if (actor?.rollInitiative) {
        // Get the initiative value from the actor
        const initiativeValue = await actor.rollInitiative(options);
        
        // If the actor returns a number, update the combatant's initiative
        if (typeof initiativeValue === 'number') {
          await this.setInitiative(cid, initiativeValue);
        }
        // If the actor handled everything internally, we're done
      } else {
        // Fallback to default behavior if actor doesn't have rollInitiative
        await super.rollInitiative([cid], options);
      }
    }
  }
}