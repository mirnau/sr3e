export default class ArmorResolver {
  static computeEffectiveArmor(defender, packet) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, ArmorResolver.computeEffectiveArmor.name]);
    const useImpact = String(packet?.armorUse || "ballistic") === "impact";
    const mult = packet?.armorMult || { ballistic: 1, impact: 1 };

    const wearables = defender?.items?.filter?.((i) => i.type === "wearable") ?? [];
    const equipped = wearables.filter((i) => !!i.getFlag("sr3e", "isEquipped"));

    let ballisticBase = 0, impactBase = 0;
    for (const w of equipped) {
      ballisticBase = Math.max(ballisticBase, Number(w?.system?.armor?.ballistic ?? 0) || 0);
      impactBase = Math.max(impactBase, Number(w?.system?.armor?.impact ?? 0) || 0);
    }

    let eff = useImpact ? impactBase * Number(mult.impact ?? 1) : ballisticBase * Number(mult.ballistic ?? 1);
    eff = Math.max(0, Math.floor(eff));

    return {
      armorType: useImpact ? "impact" : "ballistic",
      base: useImpact ? impactBase : ballisticBase,
      effective: eff,
      ballisticBase,
      impactBase,
    };
  }
}
