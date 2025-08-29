import { writable, derived, get } from "svelte/store";
import BaseSkillShopping from "./BaseSkillShopping.js";

export default class ActiveSkillsCreationShopping extends BaseSkillShopping {
  constructor({ actor, skill, actorStoreManager, itemStoreManager, isShoppingStateStore }) {
    super({ actor, skill, actorStoreManager, itemStoreManager });

    this.isShoppingStateStore = isShoppingStateStore;
    this.pointsStore = actorStoreManager.GetRWStore("creation.activePoints");

    this.stagedBase = writable(0);
    this.sessionActive = false;

    this.displayBase = derived([this.stagedBase], ([$b]) => ($b ?? 0));

    this.canIncrementRO = derived([this.stagedBase, this.pointsStore], () => this.computeCanIncrement());
    this.canDecrementRO = derived([this.stagedBase], () => this.computeCanDecrement());

    this._sessionUnsub = this.isShoppingStateStore?.subscribe?.((v) => {
      if (v && !this.sessionActive) this._startSession();
      else if (!v && this.sessionActive) this._commitAndEndSession();
    });
  }

  dispose() { if (this.sessionActive) this.rollback(); this._sessionUnsub && this._sessionUnsub(); }

  _startSession() {
    this.sessionActive = true;
    this.baselineBase = this.currentBase();
    this.baselinePoints = Number(get(this.pointsStore) || 0);
    this.stagedBase.set(this.baselineBase);
  }

  _commitAndEndSession() {
    const finalBase = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    if (finalBase !== this.currentBase()) this.baseRW.set(finalBase);
    const spent = this._stagedSpentPoints();
    if (spent !== 0) this.pointsStore.set(this.baselinePoints - spent);
    this.sessionActive = false;
  }

  rollback() { if (!this.sessionActive) return; this.stagedBase.set(this.baselineBase); this.sessionActive = false; }

  nextTarget() { return (Number(get(this.stagedBase) ?? this.baselineBase) || 0) + 1; }

  _stagedSpentPoints() {
    const target = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    let spent = 0;
    const linked = this.linkedAttributeSum();
    for (let r = this.baselineBase + 1; r <= target; r++) {
      spent += r <= linked ? 1 : 2;
    }
    return spent;
  }

  _availablePoints() { return (this.baselinePoints || 0) - this._stagedSpentPoints(); }

  computeCanIncrement() { if (!this.sessionActive) return false; return this._availablePoints() >= (this.nextTarget() <= this.linkedAttributeSum() ? 1 : 2); }
  computeCanDecrement() { if (!this.sessionActive) return false; const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0; return cur > this.baselineBase; }

  applyIncrement() { if (!this.computeCanIncrement()) return; const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0; this.stagedBase.set(cur + 1); }
  applyDecrement() { const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0; if (cur <= this.baselineBase) return; this.stagedBase.set(cur - 1); }
}

