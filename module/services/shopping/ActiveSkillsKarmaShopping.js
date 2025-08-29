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
    this.baselineSpecs = [];
    this.newSpecFloorsByIndex = new Map();

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
    // snapshot specializations for rollback
    try {
      const curSpecs = get(this.specsRW) || [];
      this.baselineSpecs = Array.isArray(curSpecs) ? curSpecs.map((s) => ({ ...s })) : [];
    } catch { this.baselineSpecs = []; }
    this.newSpecFloorsByIndex.clear();
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
    this.newSpecFloorsByIndex.clear();
  }

  rollback() {
    if (!this.sessionActive) return;
    this.stagedBase.set(this.baselineBase);
    // revert specializations to snapshot
    try { this.specsRW.set(this.baselineSpecs.map((s) => ({ ...s }))); } catch {}
    const sess = get(this.sessionKarma);
    if (sess?.active) this.sessionKarma.set({ active: false, baseline: 0, stagedSpent: 0 });
    this.sessionActive = false;
    this.newSpecFloorsByIndex.clear();
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

  // ---- Specializations (Karma) ----
  _specs() {
    try { return Array.isArray(get(this.specsRW)) ? [...get(this.specsRW)] : []; } catch { return []; }
  }

  _setSpecs(next) {
    try { this.specsRW.set(Array.isArray(next) ? next.map((s)=>({ ...s })) : []); } catch {}
  }

  addSpecialization(name = "") {
    if (!this.sessionActive) return false;
    const base = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    if (base <= 0) return false; // must possess base skill
    const currentSpecs = this._specs();
    const maxCount = this.maxSpecializationsAllowed(base);
    if (currentSpecs.length >= maxCount) return false;
    const newRating = base + 1;
    const cost = Math.ceil(this.costForSpecializationTarget(newRating));
    if (this._availableKarma() < cost) return false;
    const nextIndex = currentSpecs.length;
    const next = [...currentSpecs, { name, value: newRating }];
    this._setSpecs(next);
    this.newSpecFloorsByIndex.set(nextIndex, newRating);
    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: (sess.stagedSpent || 0) + cost });
    return true;
  }

  incrementSpecialization(specRef) {
    if (!this.sessionActive || !specRef) return false;
    const specs = this._specs();
    const idx = specs.indexOf(specRef);
    if (idx < 0) return false;
    const base = Number(get(this.stagedBase) ?? this.baselineBase) || 0;
    const cur = Number(specs[idx]?.value ?? 0) || 0;
    const nextRating = cur + 1;
    if (nextRating > this.maxSpecRating(base)) return false;
    const cost = Math.ceil(this.costForSpecializationTarget(nextRating));
    if (this._availableKarma() < cost) return false;
    specs[idx] = { ...specs[idx], value: nextRating };
    this._setSpecs(specs);
    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: (sess.stagedSpent || 0) + cost });
    return true;
  }

  decrementSpecialization(specRef) {
    if (!this.sessionActive || !specRef) return false;
    const specs = this._specs();
    const idx = specs.indexOf(specRef);
    if (idx < 0) return false;
    const cur = Number(specs[idx]?.value ?? 0) || 0;
    const baselineCur = this._baselineSpecValue(idx, specs[idx]);
    if (cur <= baselineCur) return false;
    const refund = Math.ceil(this.costForSpecializationTarget(cur));
    specs[idx] = { ...specs[idx], value: cur - 1 };
    this._setSpecs(specs);
    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: Math.max(0, (sess.stagedSpent || 0) - refund) });
    return true;
  }

  _baselineSpecValue(index, specObj) {
    if (this.newSpecFloorsByIndex.has(index)) return Number(this.newSpecFloorsByIndex.get(index) || 0) || 0;
    // Prefer index-aligned baseline when available to survive renames
    try {
      const idxBaseline = this.baselineSpecs?.[index];
      if (idxBaseline && typeof idxBaseline.value !== "undefined") return Number(idxBaseline.value || 0) || 0;
    } catch {}
    try {
      const byName = (this.baselineSpecs || []).find((s) => s?.name === specObj?.name);
      if (byName) return Number(byName.value || 0) || 0;
    } catch {}
    return 0;
  }

  deleteSpecialization(specRef) {
    if (!this.sessionActive || !specRef) return false;
    const specs = this._specs();
    const idx = specs.indexOf(specRef);
    if (idx < 0) return false;

    const isNewThisSession = this.newSpecFloorsByIndex.has(idx);
    if (!isNewThisSession) {
      specs.splice(idx, 1);
      this._setSpecs(specs);
      this._reindexNewSpecFloorsAfterDeletion(idx);
      return true;
    }

    const floor = Number(this.newSpecFloorsByIndex.get(idx) || 0) || 0;
    const cur = Number(specs[idx]?.value || 0) || 0;
    let totalRefund = 0;
    for (let r = cur; r >= floor; r--) totalRefund += Math.ceil(this.costForSpecializationTarget(r));

    specs.splice(idx, 1);
    this._setSpecs(specs);
    this._reindexNewSpecFloorsAfterDeletion(idx);

    const sess = get(this.sessionKarma) || { active: true, baseline: 0, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, active: true, stagedSpent: Math.max(0, (sess.stagedSpent || 0) - totalRefund) });
    return true;
  }

  _reindexNewSpecFloorsAfterDeletion(deletedIndex) {
    if (!this.newSpecFloorsByIndex || this.newSpecFloorsByIndex.size === 0) return;
    const next = new Map();
    for (const [i, floor] of this.newSpecFloorsByIndex.entries()) {
      if (i === deletedIndex) continue;
      next.set(i > deletedIndex ? i - 1 : i, floor);
    }
    this.newSpecFloorsByIndex = next;
  }

  // Public commit: finalize staged changes and optionally restart session baseline
  commit(restart = true) {
    if (!this.sessionActive) return false;
    this._commitAndEndSession();
    if (restart) this._startSession();
    return true;
  }
}
