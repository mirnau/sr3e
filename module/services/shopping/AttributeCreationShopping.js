import { get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

export default class AttributeCreationShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, max, disallowRaise = false }) {
    super({ actor, key, storeManager, rml, max, disallowRaise });
    this.points = storeManager.GetRWStore("creation.attributePoints");
  }

  _canIncrement(t) {
    if (this.disallowRaise) return false;
    const p = get(this.points);
    if (p <= 0) return false;
    if (this.rml != null && t > this.rml) return false;
    return true;
  }

  _canDecrement() {
    if (this.disallowRaise) return false;
    const base = get(this.baseRW);
    return base > 1;
  }

  _applyIncrement() {
    if (this.disallowRaise) return;
    const p = get(this.points);
    if (p <= 0) return;
    const b = get(this.baseRW);
    this.points.set(p - 1);
    this.baseRW.set(b + 1);
  }

  _applyDecrement() {
    if (this.disallowRaise) return;
    const b = get(this.baseRW);
    if (b <= 1) return;
    this.baseRW.set(b - 1);
    const p = get(this.points);
    this.points.set(p + 1);
  }
}
