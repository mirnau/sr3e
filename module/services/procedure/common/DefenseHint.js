export default class DefenseHint {
  static getDefenseTNAdd(weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DefenseHint.getDefenseTNAdd.name]);
    const mode = String(weapon?.system?.mode ?? "");
    const mods = weapon?.system?.defense?.tnMods;
    if (mods && typeof mods === "object" && Object.prototype.hasOwnProperty.call(mods, mode)) {
      const v = Number(mods[mode]);
      if (Number.isFinite(v)) return v;
      throw new Error(`sr3e: weapon.system.defense.tnMods[${mode}] must be a finite number`);
    }
    return 0;
  }

  static getDefenseTNLabel(weapon) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DefenseHint.getDefenseTNLabel.name]);
    return weapon?.system?.defense?.tnLabel ?? "Weapon difficulty";
  }

  static fromInitiatorRoll(initiatorRoll) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DefenseHint.fromInitiatorRoll.name]);
    const o = initiatorRoll?.options ?? {};
    if (o.type !== "item" || !o.itemId) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
    const actor = ChatMessage.getSpeakerActor(o.speaker);
    const weapon = game.items.get(o.itemId) || actor?.items?.get?.(o.itemId) || null;
    if (!weapon) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
    const tnMod = this.getDefenseTNAdd(weapon);
    const tnLabel = this.getDefenseTNLabel(weapon);
    return { type: "attribute", key: "reaction", tnMod, tnLabel };
  }
}
