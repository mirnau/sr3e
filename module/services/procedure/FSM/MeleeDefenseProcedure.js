// module/services/procedure/FSM/MeleeDefenseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";

function cap(s) { return typeof s === "string" && s ? s[0].toUpperCase() + s.slice(1) : s; }

export default class MeleeDefenseProcedure extends AbstractProcedure {
  constructor(defender, _item = null, args = {}) {
    super(defender, _item, { lockPriority: "advanced" });
    this.args = args || {};
    this.mode = (this.args.mode === "full") ? "full" : "standard";   // "standard" | "full"

    // Seed UI from hydrated basis (built in MeleeProcedure.buildDefenseProcedure)
    const b = this.args.basis || {};
    this.dice = Math.max(0, Number(b.dice ?? 0));

    // Nice panel title
    if (this.mode === "full") {
      this.title = b?.type === "attribute"
        ? `Parry (${cap(b.key || "Strength")})`
        : `Parry (${b?.name || "Melee"})`;
    } else {
      this.title = game?.i18n?.localize?.("sr3e.label.standardDefense") ?? "Standard Defense";
    }

  }

  // Composer labels
  getKindOfRollLabel() {
    return this.mode === "full"
      ? (game?.i18n?.localize?.("sr3e.label.fullDefense") ?? "Full Defense")
      : (game?.i18n?.localize?.("sr3e.label.standardDefense") ?? "Standard Defense");
  }
  getPrimaryActionLabel() {
    return this.mode === "full"
      ? (game?.i18n?.localize?.("sr3e.button.fullDefend") ?? "Full Defense")
      : (game?.i18n?.localize?.("sr3e.button.defend") ?? "Defend");
  }
  getFlavor() { return String(this.title || (this.mode === "full" ? "Melee Defense (Full)" : "Melee Defense (Standard)")); }
  getChatDescription() { return `<div>${this.getFlavor()}</div>`; }

  // Build the defense test:
  // - STANDARD: base/basis + pool + karma
  // - FULL:     base/basis + karma   (no pool on this initial test)
  buildFormula(explodes = true) {
    const b = this.args?.basis || {};
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
    const b = this.args?.basis || {};
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