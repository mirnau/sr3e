import { get, writable, derived } from "svelte/store";

export default class BaseAttributeShopping {
  constructor(opts) {
    const { actor, key, storeManager, rml, max, disallowRaise } = opts || {};

    this.actor = actor;
    this.key = key;
    this.storeManager = storeManager;
    this.rml = rml ?? null;
    this.max = max ?? null;
    this.disallowRaise = !!disallowRaise;

    // Actor stores
    this.valueRO = storeManager.GetSumROStore(`attributes.${key}`);     // { value, mod, sum }
    this.baseRW  = storeManager.GetRWStore(`attributes.${key}.value`);  // number

    // These derived booleans are provided by subclasses (we init to safe stores).
    this.canIncrementRO = writable(false);
    this.canDecrementRO = writable(false);
  }

  // Creation uses actor base; Karma overrides to use staged base.
  nextTarget() {
    return (get(this.baseRW) || 0) + 1;
  }

  withinMax(t) {
    if (this.max == null) return true;
    return t <= this.max;
  }

  atMin() {
    const v = get(this.valueRO);
    return (v?.value || 0) <= 1;
  }

  computeCanIncrement() {
    if (this.disallowRaise) return false;
    const t = this.nextTarget();
    if (!this.withinMax(t)) return false;
    return this._canIncrement(t);
  }

  computeCanDecrement() {
    return this._canDecrement();
  }

  applyIncrement() {
    if (!this.computeCanIncrement()) return;
    this._applyIncrement();
  }

  applyDecrement() {
    if (!this.computeCanDecrement()) return;
    this._applyDecrement();
  }

  // Hooks for subclasses
  _canIncrement(_t) { return false; }
  _canDecrement() { return false; }
  _applyIncrement() {}
  _applyDecrement() {}
}
