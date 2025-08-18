// module/services/procedure/FSM/MeleeStandardDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";

export default class MeleeStandardDefenseProcedure extends AbstractProcedure {
  constructor(defender, _item = null, args = {}) {
    super(defender, _item, args);
  }

  getFlavor() { return "Melee Defense (Standard)"; }
  getChatDescription() { return `<div>Melee Defense (Standard)</div>`; }
  getPrimaryActionLabel() { return game?.i18n?.localize?.("sr3e.button.defend") ?? "Defend"; }

  // No pool limitations; defender can add their chosen Combat Pool
  async execute({ OnClose } = {}) {
    OnClose?.();
    const actor = this.caller;
    const formula = this.buildFormula(true);
    const roll = await SR3ERoll.create(formula, { actor }).evaluate(this);
    await roll.waitForResolution();

    // Tag the roll minimally so the resolver knows this was "standard"
    roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: "standard" };
    return roll;
  }
}

try { AbstractProcedure.register?.("melee-standard", MeleeStandardDefenseProcedure); } catch {}
