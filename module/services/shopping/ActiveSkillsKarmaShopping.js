import { writable, derived, get } from "svelte/store";
import BaseSkillShopping from "./BaseSkillShopping.js";

export default class ActiveSkillsKarmaShopping extends BaseSkillShopping {
  constructor({ actor, skill, actorStoreManager, itemStoreManager, isShoppingStateStore }) {
    super({ actor, skill, actorStoreManager, itemStoreManager });

    this.isShoppingStateStore = isShoppingStateStore;

    // Karma resources + session aggregator (shared across attributes/skills)
    this.goodKarma = actorStoreManager.GetRWStore("karma.goodKarma");
    this.spentKarma = actorStoreManager.GetRWStore("karma.spentKarma");
    this.sessionKarma = actorStoreManager.GetShallowStore(actor.id, "shoppingKarmaSession", {
      active: false,
      baseline: 0,
      stagedSpent: 0,
    });

    // Staged base
    this.stagedBase = writable(0);
    this.sessionActive = false;

    // Display uses staged base directly (no mod for skills)
    this.displayBase = derived([this.stagedBase], ([$b]) => ($b ?? 0));

    // Guards
    this.canIncrementRO = derived([this.stagedBase, this.sessionKarma], () => this.computeCanIncrement());
    this.canDecrementRO = derived([this.stagedBase], () => this.computeCanDecrement());

    // React to shopping state
    this._sessionUnsub = this.isShoppingStateStore?.subscribe?.((v) => {
      if (v && !this.sessionActive) this._startSession();
      else if (!v && this.sessionActive) this._commitAndEndSession();
    });
  }

  dispose() {
    if (this.sessionActive) this.rollback();
    this._sessionUnsub && this._sessionUnsub();
  }

  _startSession() {
    this.sessionActive = true;
    this.baselineBase = this.currentBase();
    const sess = get(this.sessionKarma);
    if (!sess?.active) {
      const baseline = Number(get(this.goodKarma) ?? 0);
      this.sessionKarma.set({ active: true, baseline, stagedSpent: 0 });
    }
    this.stagedBase.set(this.baselineBase);
  }

  _commitAndEndSession() {
    const finalBase = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    if (finalBase !== this.currentBase()) this.baseRW.set(finalBase);

    const sess = get(this.sessionKarma);
    if (sess?.active) {
      const totalSpent = Number(sess.stagedSpent || 0);
      if (totalSpent > 0) {
        const baseline = Number(sess.baseline || 0);
        this.goodKarma.set(baseline - totalSpent);
        const prevSpent = Number(get(this.spentKarma) || 0);
        this.spentKarma.set(prevSpent + totalSpent);
      }
      this.sessionKarma.set({ active: false, baseline: 0, stagedSpent: 0 });
    }
    this.sessionActive = false;
  }

  rollback() {
    if (!this.sessionActive) return;
    this.stagedBase.set(this.baselineBase);
    const sess = get(this.sessionKarma);
    if (sess?.active) this.sessionKarma.set({ active: false, baseline: 0, stagedSpent: 0 });
    this.sessionActive = false;
  }

  _availableKarma() {
    const sess = get(this.sessionKarma) || { baseline: 0, stagedSpent: 0 };
    return (sess.baseline || 0) - (sess.stagedSpent || 0);
  }

  nextTarget() {
    return (Number(get(this.stagedBase) ?? this.baselineBase) || 0) + 1;
  }

  computeCanIncrement() {
    if (!this.sessionActive) return false;
    const newRating = this.nextTarget();
    const cost = Math.ceil(this.costForTarget(newRating));
    return this._availableKarma() >= cost;
  }

  computeCanDecrement() {
    if (!this.sessionActive) return false;
    const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    return cur > this.baselineBase;
  }

  applyIncrement() {
    const newRating = this.nextTarget();
    const cost = Math.ceil(this.costForTarget(newRating));
    if (!this.computeCanIncrement()) return;
    const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    this.stagedBase.set(cur + 1);
    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: (sess.stagedSpent || 0) + cost });
  }

  applyDecrement() {
    const cur = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    if (cur <= this.baselineBase) return;
    const refund = Math.ceil(this.costForTarget(cur));
    this.stagedBase.set(cur - 1);
    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: Math.max(0, (sess.stagedSpent || 0) - refund) });
  }
}
