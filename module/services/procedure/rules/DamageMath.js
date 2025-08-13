export default class DamageMath {
  static boxesForLevel(step) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.boxesForLevel.name]);
    if (step === "l") return 1;
    if (step === "m") return 3;
    if (step === "s") return 6;
    if (step === "d") return 10;
    return 0;
  }

  static splitDamageType(t) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.splitDamageType.name]);
    const key = String(t || "").trim();
    const lower = key.toLowerCase();
    const isStun = lower.includes("stun");
    if (lower.startsWith("l")) return { step: "l", trackKey: isStun ? "stun" : "physical" };
    if (lower.startsWith("m")) return { step: "m", trackKey: isStun ? "stun" : "physical" };
    if (lower.startsWith("s")) return { step: "s", trackKey: isStun ? "stun" : "physical" };
    if (lower.startsWith("d")) return { step: "d", trackKey: isStun ? "stun" : "physical" };
    return { step: "l", trackKey: "physical" };
  }

  static stageStep(step, delta) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.stageStep.name]);
    const order = ["l", "m", "s", "d"];
    const i = order.indexOf(step);
    if (i < 0) return step;
    let n = i + Number(delta || 0);
    if (n < 0) return null;
    if (n >= order.length) n = order.length - 1;
    return order[n];
  }

  static applyAttackStaging(baseStep, netAttackSuccesses = 0, extraLevelDelta = 0) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.applyAttackStaging.name]);
    const up = Math.floor(Math.max(0, Number(netAttackSuccesses || 0)) / 2);
    return this.stageStep(baseStep, up + Number(extraLevelDelta || 0));
  }

  static applyResistanceStaging(stepAfterAttack, bodySuccesses = 0) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.applyResistanceStaging.name]);
    const down = Math.floor(Math.max(0, Number(bodySuccesses || 0)) / 2);
    return this.stageStep(stepAfterAttack, -down);
  }

  static computeResistanceTN(packet, effArmor) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DamageMath.computeResistanceTN.name]);
    const p = Math.max(0, Number(packet?.power ?? 0));
    const resistAdd = Number(packet?.resistTNAdd ?? 0) || 0;
    let tn = p - Number(effArmor?.effective ?? 0);
    return Math.max(2, tn + resistAdd);
  }
}
