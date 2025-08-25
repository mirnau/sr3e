// module/services/procedure/FSM/MeleeDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import { localize } from "@services/utilities.js";

function RuntimeConfig() {
   return CONFIG?.sr3e || {};
}

function cap(s) { return typeof s === "string" && s ? s[0].toUpperCase() + s.slice(1) : s; }

export default class MeleeDefenseProcedure extends AbstractProcedure {
  constructor(defender, _item = null, args = {}) {
    super(defender, _item, { lockPriority: "advanced" });
    this.args = args || {};
    this.mode = (this.args.mode === "full") ? "full" : "standard";   // "standard" | "full"

    if (args?.basis) {
      this.setResponderBasis(args.basis);
      this.applyResponderBasisDice();
    }

    const b = this.getResponderBasis() || {};

    if (this.mode === "full") {
      const parry = localize(RuntimeConfig().procedure.parry);
      this.title = b?.type === "attribute"
        ? `${parry} (${cap(b.key)})`
        : `${parry} (${b?.name})`;
    } else {
      this.title = localize(RuntimeConfig().procedure.standardDefense);
    }
  }

  // Composer labels
  getKindOfRollLabel() {
    return this.mode === "full"
      ? localize(RuntimeConfig().procedure.fullDefense)
      : localize(RuntimeConfig().procedure.standardDefense);
  }

  getPrimaryActionLabel() {
    return this.mode === "full"
      ? localize(RuntimeConfig().procedure.fullDefend)
      : localize(RuntimeConfig().procedure.defend);
  }

  getFlavor() { return String(this.title); }
  getChatDescription() { return `<div>${this.getFlavor()}</div>`; }

  // Build the defense test:
  // - STANDARD: base/basis + pool + karma
  // - FULL:     base/basis + karma   (no pool on this initial test)
  buildFormula(explodes = true) {
    const b = this.getResponderBasis() || {};
    const baseDice  = Math.max(0, Math.floor(Number(b.dice ?? this.dice ?? 0)));
    const poolDice  = this.mode === "full" ? 0 : Math.max(0, Math.floor(Number(this.poolDice) || 0));
    const karmaDice = Math.max(0, Math.floor(Number(this.karmaDice) || 0));
    const total = baseDice + poolDice + karmaDice;

    if (!Number.isFinite(total) || total <= 0) return "0d6";
    const head = `${total}d6`;
    if (!explodes) return head;
    const tn = Math.max(2, Number(this.finalTN()) || 2);
    return `${head}x${tn}`;
  }

  async execute({ OnClose } = {}) {
    OnClose?.();

    // Enforce “no pool” on Full Defense initial test
    if (this.mode === "full") this.poolDice = 0;

    // Safety: restore from basis if UI zeroed it
    const b = this.getResponderBasis() || {};
    if ((this.dice | 0) <= 0) this.dice = Math.max(0, Number(b.dice ?? 0));

    const actor = this.caller;
    const roll  = await SR3ERoll.create(this.buildFormula(true), { actor }).evaluate(this);
    await roll.waitForResolution();

    // Tag the roll so your contested resolver can branch
    const o = (roll.toJSON().options = { ...(roll.options || {}), meleeDefenseMode: this.mode });
    o.testName = this.getFlavor();
    if (b?.type === "attribute") {
      o.attributeKey   = String(b.key || "strength");
      o.isDefaulting   = b.isDefaulting ?? true;
      if (Number.isFinite(Number(b.dice))) o.attributeDice = Number(b.dice);
    } else if (b?.type === "skill") {
      o.skill = { id: b.id, name: b.name };
      if (b.specialization) o.specialization = b.specialization;
      if (Number.isFinite(Number(b.dice))) o.skillDice = Number(b.dice);
    }
    return roll;
  }
}
