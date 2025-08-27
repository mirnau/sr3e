// KarmaAttributeShopper.js
import BaseAttributeShopper from "./BaseAttributeShopper.js";

const RAISE_BANNED = new Set(["essence", "magic", "reaction"]);

export default class KarmaAttributeShopper extends BaseAttributeShopper {
  constructor(ctx) {
    super(ctx);
    this.goodKarma = this.storeManager.GetRWStore("karma.goodKarma");
    this.spentKarma = this.storeManager.GetRWStore("karma.spentKarma");
  }

  _eligibleKey() {
    if (RAISE_BANNED.has(this.key)) return false;
    // Physical + Mental: body, quickness, strength, charisma, intelligence, willpower
    return true;
  }

  _costForTarget(target) {
    // Up to RML: 2 × target; above RML (<= attrMax): 3 × target
    if (this.rml && target <= this.rml) return 2 * target;
    return 3 * target;
  }

  canIncrease() {
    if (!this._eligibleKey()) return false;
    if (!this.rml || !this.attrMax) return false;

    const current = this._currentBase();
    const target = current + 1;
    if (target > this.attrMax) return false;

    const need = this._costForTarget(target);
    return (this.goodKarma?.get?.() ?? 0) >= need;
  }

  // In post-creation karma shopping we generally do not refund with “-1”
  canDecrease() { return false; }

  applyDelta(delta) {
    if (delta !== +1) return; // only support +1 by the book
    if (!this.canIncrease()) return;

    const target = this._targetBase(+1);
    const cost = this._costForTarget(target);

    // Spend & apply on the natural value
    this.goodKarma.set(this.goodKarma.get() - cost);
    this.spentKarma.set((this.spentKarma.get?.() ?? 0) + cost);
    this.baseStore.set(this.baseStore.get() + 1);
  }
}
