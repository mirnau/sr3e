// services/shopping/AttributeCreationShopping.js
import { get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

export default class AttributeCreationShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, max }) {
    super({ actor, key, storeManager, rml, max, disallowRaise: false });
    this.points = storeManager.GetRWStore("creation.attributePoints");
  }

  _canIncrement(t) {
    const p = get(this.points);
    if (p <= 0) return false;
    if (this.rml != null && t > this.rml) return false;
    return true;
  }

  _canDecrement() {
    const base = get(this.baseRW);
    return base > 1;
  }

  _applyIncrement() {
    const p = get(this.points);
    if (p <= 0) return;
    const b = get(this.baseRW);
    this.points.set(p - 1);
    this.baseRW.set(b + 1);
  }

  _applyDecrement() {
    const b = get(this.baseRW);
    if (b <= 1) return;
    this.baseRW.set(b - 1);
    const p = get(this.points);
    this.points.set(p + 1);
  }
}
