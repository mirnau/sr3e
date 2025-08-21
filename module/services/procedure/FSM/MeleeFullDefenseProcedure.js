import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";

export default class MeleeFullDefenseProcedure extends AbstractProcedure {
  constructor(defender, _item = null, args = {}) {
    super(defender, _item);
    this.args = args || {};

    ProcedureLock.assertEnter({
      ownerKey: `${this.constructor.name}:${this.caller?.id}`,
      priority: "advanced",
      onDenied: () => {}
    });
  }

  getFlavor() { return "Melee Defense (Full)"; }
  getChatDescription() { return `<div>Melee Defense (Full)</div>`; }
  getPrimaryActionLabel() { return game?.i18n?.localize?.("sr3e.button.fullDefend") ?? "Full Defense"; }

  // SENTINEL: force a constant exploding formula
  buildFormula(explodes = true) {
    return "100d6x4";
  }

  async execute({ OnClose } = {}) {
    OnClose?.();

    // Full Defense initial test: ignore pool on this one roll
    this.poolDice = 0;

    const actor = this.caller;
    const formula = this.buildFormula(true);
    console.warn("[DEF SENTINEL] FullDefense formula ->", formula, {
      proc: this?.constructor?.name,
      basis: this?.args?.basis,
      dice: this.dice,
      pool: this.poolDice,
      karma: this.karmaDice
    });

    const roll = await SR3ERoll.create(formula, { actor }).evaluate(this);
    await roll.waitForResolution();

    // Tag so we can see it clearly in logs
    roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: "full", __sentinel: "FULL" };
    return roll;
  }

  onDestroy() {
    super.onDestroy?.();
    ProcedureLock.release(`${this.constructor.name}:${this.caller?.id}`);
  }
}

try { AbstractProcedure.register?.("melee-full", MeleeFullDefenseProcedure); } catch {}
