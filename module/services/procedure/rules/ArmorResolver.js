// ArmorResolver.js
export default class ArmorResolver {
  static #layeredSum(values) {
    // values assumed sorted DESC
    if (!values.length) return 0;
    let total = values[0];
    for (let i = 1; i < values.length; i++) total += Math.floor(values[i] / 2);
    return Math.max(0, total);
  }

  static computeEffectiveArmor(defender, packet) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, ArmorResolver.computeEffectiveArmor.name]);

    const useImpact = String(packet?.armorUse || "ballistic") === "impact";
    const mult = packet?.armorMult || { ballistic: 1, impact: 1 };

    const wearables = defender?.items?.filter?.((i) => i.type === "wearable") ?? [];
    const equipped = wearables.filter((i) => !!i.getFlag?.("sr3e", "isEquipped"));  

    // collect raw ratings
    const b = equipped.map((w) => Number(w?.system?.armor?.ballistic ?? 0) || 0).sort((a, z) => z - a);
    const i = equipped.map((w) => Number(w?.system?.armor?.impact   ?? 0) || 0).sort((a, z) => z - a);

    const ballisticBase = this.#layeredSum(b);
    const impactBase    = this.#layeredSum(i);

    let effective = useImpact
      ? impactBase * Number(mult.impact ?? 1)
      : ballisticBase * Number(mult.ballistic ?? 1);

    effective = Math.max(0, Math.floor(effective));

    return {
      armorType: useImpact ? "impact" : "ballistic",
      base:      useImpact ? impactBase : ballisticBase,
      effective,
      ballisticBase,
      impactBase,
    };
  }
}
