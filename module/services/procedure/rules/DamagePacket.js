export default class DamagePacket {
  static build({ weapon, plan, directives = [], rangeBand = null } = {}) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamagePacket.build.name]);
    const basePower = Number(weapon?.system?.damage ?? 0);
    const baseType = String(weapon?.system?.damageType ?? "");
    let power = Math.max(0, basePower + Number(plan?.powerDelta ?? 0));
    let type = baseType;
    let levelDelta = Number(plan?.levelDelta ?? 0);
    let attackTNAdd = 0;
    let resistTNAdd = 0;
    let armorUse = "ballistic";
    let armorMult = { ballistic: 1, impact: 1 };
    const notes = [...(plan?.notes ?? [])];

    if (rangeBand && Number.isFinite(rangeBand?.powerAdd)) power += Number(rangeBand.powerAdd);
    if (rangeBand && Number.isFinite(rangeBand?.levelDelta)) levelDelta += Number(rangeBand.levelDelta);

    for (const x of directives) {
      if (x.k === "damage.powerAdd") power += Number(x.v || 0);
      else if (x.k === "damage.levelDelta") levelDelta += Number(x.v || 0);
      else if (x.k === "damage.type") type = String(x.v || type);
      else if (x.k === "attack.tnAdd") attackTNAdd += Number(x.v || 0);
      else if (x.k === "resist.tnAdd") resistTNAdd += Number(x.v || 0);
      else if (x.k === "armor.use") armorUse = String(x.v || armorUse);
      else if (x.k === "armor.mult.ballistic") armorMult.ballistic *= Number(x.v || 1);
      else if (x.k === "armor.mult.impact") armorMult.impact *= Number(x.v || 1);
      else if (x.k?.startsWith("special.")) notes.push(x.k.replace("special.", ""));
    }

    return { power, damageType: type, levelDelta, attackTNAdd, resistTNAdd, armorUse, armorMult, notes };
  }
}
