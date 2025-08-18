// module/services/procedure/FSM/MeleeFullDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";

/**
 * Full Defense (Parry): skill only, NO Combat Pool.
 * We hard-zero any pool contribution at roll time to enforce it.
 */
export default class MeleeFullDefenseProcedure extends AbstractProcedure {
  constructor(defender, _item = null, args = {}) {
    super(defender, _item, args);
  }

  getFlavor() { return "Melee Defense (Full)"; }
  getChatDescription() { return `<div>Melee Defense (Full)</div>`; }
  getPrimaryActionLabel() { return game?.i18n?.localize?.("sr3e.button.fullDefend") ?? "Full Defense"; }

  async execute({ OnClose } = {}) {
    OnClose?.();

    // Force NO pool dice (composer may still show a pool selector; we ignore it here).
    this.poolDice = 0;

    const actor = this.caller;
    const formula = this.buildFormula(true);
    const baseRoll = SR3ERoll.create(formula, { actor });

    // Also sanitize any array-based pools on the roll options if present
    baseRoll.options = {
      ...(baseRoll.options || {}),
      pools: [], // disallow named pools entirely
    };

    const roll = await baseRoll.evaluate(this);
    await roll.waitForResolution();

    // Tag for resolver so it can run the optional Dodge step if attacker wins/ties
    roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: "full" };
    return roll;
  }
}

try { AbstractProcedure.register?.("melee-full", MeleeFullDefenseProcedure); } catch {}
