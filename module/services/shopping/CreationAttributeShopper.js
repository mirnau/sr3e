// CreationAttributeShopper.js
import BaseAttributeShopper from "./BaseAttributeShopper.js";

export default class CreationAttributeShopper extends BaseAttributeShopper {
  constructor(ctx) {
    super(ctx);
    this.pointsStore = this.storeManager.GetRWStore("creation.attributePoints");
  }

  canIncrease() {
    if (this.key === "reaction") return false; // UI already guards, keep hard guard here too
    const points = this.pointsStore ?? 0;
    const target = this._targetBase(+1);
    if (this.rml && target > this.rml) return false;
    return points > 0;
  }

  canDecrease(minFloor = 1, committedFloor = null, isLocked = false) {
    const current = this._currentBase();
    const floor = isLocked && committedFloor != null ? committedFloor : minFloor;
    return current > floor;
  }

  applyDelta(delta, opts = {}) {
    // delta ∈ {+1,-1}
    if (delta === +1) {
      if (!this.canIncrease()) return;
      this.pointsStore.set(this.pointsStore.get() - 1);
      this.baseStore.set(this.baseStore.get() + 1);
      return;
    }
    if (delta === -1) {
      const { minFloor = 1, committedFloor = null, isLocked = false } = opts;
      if (!this.canDecrease(minFloor, committedFloor, isLocked)) return;
      this.pointsStore.set(this.pointsStore.get() + 1);
      this.baseStore.set(this.baseStore.get() - 1);
    }
  }
}
