import { get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

const TRACE = true;

export default class AttributeCreationShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, max, disallowRaise = false }) {
    super({ actor, key, storeManager, rml, max, disallowRaise });
    this.points = storeManager.GetRWStore("creation.attributePoints");
  }

  _canIncrement(t) {
    if (this.disallowRaise) return false;
    const p = get(this.points);
    if (p <= 0) {
      TRACE && console.log(`[Creation:canUp] false — no points`);
      return false;
    }
    if (this.rml != null && t > this.rml) {
      TRACE && console.log(`[Creation:canUp] false — at cap RML=${this.rml} target=${t}`);
      return false;
    }
    TRACE && console.log(`[Creation:canUp] true — next=${t} points=${p}`);
    return true;
  }

  _canDecrement() {
    if (this.disallowRaise) return false;
    const base = get(this.baseRW);
    const ok = base > 1;
    TRACE && console.log(`[Creation:canDown] ${ok} — base=${base}`);
    return ok;
  }

  _applyIncrement() {
    if (this.disallowRaise) return;
    const p = get(this.points);
    if (p <= 0) return;
    const b = get(this.baseRW);
    this.points.set(p - 1);
    this.baseRW.set(b + 1);
    TRACE && console.log(`[Creation:up] base ${b} → ${b + 1} (points ${p} → ${p - 1})`);
  }

  _applyDecrement() {
    if (this.disallowRaise) return;
    const b = get(this.baseRW);
    if (b <= 1) return;
    const p = get(this.points);
    this.baseRW.set(b - 1);
    this.points.set(p + 1);
    TRACE && console.log(`[Creation:down] base ${b} → ${b - 1} (points ${p} → ${p + 1})`);
  }
}
