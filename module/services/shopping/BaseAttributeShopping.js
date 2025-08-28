import { get } from "svelte/store";

export default class BaseAttributeShopping {
  constructor(opts) {
    const { actor, key, storeManager, rml, max, disallowRaise } = opts || {};

    this.actor = actor;
    this.key = key;
    this.storeManager = storeManager;
    this.rml = rml ?? null;
    this.max = max ?? null;
    this.disallowRaise = !!disallowRaise;

    this.valueRO = storeManager.GetSumROStore(`attributes.${key}`);
    this.baseRW = storeManager.GetRWStore(`attributes.${key}.value`);
  }

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

  _canIncrement(_t) { return false; }
  _canDecrement() { return false; }
  _applyIncrement() {}
  _applyDecrement() {}
}
