export default class DirectiveRegistry {
  static #providers = new Map(); // familyKey → [fn]

  static register(familyKey, fn) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DirectiveRegistry.register.name]);
    if (!familyKey || typeof fn !== "function") throw new Error("sr3e: invalid directive provider");
    if (!this.#providers.has(familyKey)) this.#providers.set(familyKey, []);
    this.#providers.get(familyKey).push(fn);
  }

  static collect({ familyKey, weapon, ammo, situational }) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, DirectiveRegistry.collect.name]);
    const out = [];
    const arr = this.#providers.get(familyKey) || [];
    for (const fn of arr) {
      const part = fn({ weapon, ammo, situational }) || [];
      for (const d of part) out.push(d);
    }
    return out;
  }
}
