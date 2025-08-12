export default class WeaponModePlanners {
  static #map = new Map(); // CONFIG.sr3e.weaponMode keys → planner(context) => plan

  static register(modeKey, fn) {
    if (!modeKey || typeof fn !== "function") throw new Error("sr3e: invalid mode planner");
    this.#map.set(modeKey, fn);
  }

  static plan({ mode, context }) {
    const fn = this.#map.get(mode);
    if (!fn) throw new Error(`sr3e: no planner for mode "${mode}"`);
    return fn(context);
  }
}
