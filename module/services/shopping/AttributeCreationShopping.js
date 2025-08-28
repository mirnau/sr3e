import { get, writable, derived } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

export default class AttributeCreationShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, max, disallowRaise = false, isShoppingStateStore }) {
    super({ actor, key, storeManager, rml, max, disallowRaise });

    // Resources
    this.points = storeManager.GetRWStore("creation.attributePoints");

    // Session wiring
    this.isShoppingStateStore = isShoppingStateStore;
    this.sessionActive = false;
    this.baselineBase = 0;
    this.baselinePoints = 0;

    // Staged state
    this.stagedBase = writable(0);
    this.stagedSpent = writable(0); // attribute points spent during session

    // Live mod for display
    this.modRO = this.storeManager.GetROStore(`attributes.${this.key}.mod`);
    this.displayRO = derived(
      [this.stagedBase, this.modRO],
      ([$b, $m]) => ({ value: $b ?? 0, mod: $m ?? 0, sum: ($b ?? 0) + ($m ?? 0) })
    );

    // Attribute preview aggregator for derived stats (reaction, dice pools)
    this.previewStore = storeManager.GetShallowStore(actor.id, "shoppingAttributePreview", { active: false, values: {} });
    this._previewUnsub = null;

    // Chevron guards based on staged values
    this.canIncrementRO = derived([this.stagedBase, this.points], () => this.computeCanIncrement());
    this.canDecrementRO = derived([this.stagedBase], () => this.computeCanDecrement());

    // Start/commit session on shopping flag changes
    this._sessionUnsub = this.isShoppingStateStore?.subscribe?.((v) => {
      if (v && !this.sessionActive) this._startSession();
      else if (!v && this.sessionActive) this._commitAndEndSession();
    });
  }

  dispose() {
    if (this.sessionActive) this.rollback();
    this._sessionUnsub && this._sessionUnsub();
  }

  // Use STAGED base in Creation mode
  nextTarget() {
    return this._currentStagedBase() + 1;
  }

  _canIncrement(t) {
    if (!this.sessionActive) return false;
    if (this.disallowRaise) return false;
    // withinMax(t) is checked in Base.computeCanIncrement; keep RML guard for clarity
    if (this.rml != null && t > this.rml) return false;
    return this._availablePoints() >= 1; // 1 creation point per increment
  }

  _canDecrement() {
    if (!this.sessionActive) return false;
    if (this.disallowRaise) return false;
    const cur = this._currentStagedBase();
    return cur > this.baselineBase; // cannot drop below session baseline
  }

  _applyIncrement() {
    const next = this._currentStagedBase() + 1;
    if (!this._canIncrement(next)) return;
    const curSpent = get(this.stagedSpent) || 0;
    const curBase = this._currentStagedBase();
    this.stagedBase.set(curBase + 1);
    this.stagedSpent.set(curSpent + 1);
  }

  _applyDecrement() {
    const cur = this._currentStagedBase();
    if (cur <= this.baselineBase) return;
    const curSpent = get(this.stagedSpent) || 0;
    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(Math.max(0, curSpent - 1));
  }

  // --- Session helpers ---
  _startSession() {
    this.sessionActive = true;
    this.baselineBase = get(this.baseRW) || 0;
    this.baselinePoints = get(this.points) || 0;
    this.stagedBase.set(this.baselineBase);
    this.stagedSpent.set(0);

    // Mark preview active and seed current sum for this attribute
    const curPrev = get(this.previewStore) || { active: false, values: {} };
    const seedSum = (this.baselineBase ?? 0) + (get(this.modRO) ?? 0);
    this.previewStore.set({ active: true, values: { ...(curPrev.values || {}), [this.key]: seedSum } });

    // Update preview on any display change
    this._previewUnsub && this._previewUnsub();
    this._previewUnsub = this.displayRO.subscribe((v) => {
      const sum = v?.sum ?? 0;
      const cur = get(this.previewStore) || { active: true, values: {} };
      this.previewStore.set({ active: true, values: { ...(cur.values || {}), [this.key]: sum } });
    });
  }

  _commitAndEndSession() {
    const finalBase = get(this.stagedBase) || this.baselineBase;
    const stagedSpent = get(this.stagedSpent) || 0;
    if (finalBase !== get(this.baseRW)) this.baseRW.set(finalBase);
    if (stagedSpent !== 0) this.points.set(this.baselinePoints - stagedSpent);
    this.sessionActive = false;

    // Clear this attribute from preview; if none left, mark inactive
    if (this._previewUnsub) { this._previewUnsub(); this._previewUnsub = null; }
    const cur = get(this.previewStore) || { active: true, values: {} };
    if (cur?.values && this.key in cur.values) {
      const nextValues = { ...cur.values };
      delete nextValues[this.key];
      const anyLeft = Object.keys(nextValues).length > 0;
      this.previewStore.set({ active: anyLeft, values: nextValues });
    }
  }

  commit() {
    if (this.sessionActive) this._commitAndEndSession();
  }

  rollback() {
    if (!this.sessionActive) return;
    // Discard staged changes
    this.stagedBase.set(this.baselineBase);
    this.stagedSpent.set(0);
    this.sessionActive = false;

    // Clear this attribute from preview; if none left, mark inactive
    if (this._previewUnsub) { this._previewUnsub(); this._previewUnsub = null; }
    const cur = get(this.previewStore) || { active: true, values: {} };
    if (cur?.values && this.key in cur.values) {
      const nextValues = { ...cur.values };
      delete nextValues[this.key];
      const anyLeft = Object.keys(nextValues).length > 0;
      this.previewStore.set({ active: anyLeft, values: nextValues });
    }
  }

  _currentStagedBase() {
    return get(this.stagedBase) ?? this.baselineBase;
  }

  _availablePoints() {
    const staged = get(this.stagedSpent) || 0;
    return (this.baselinePoints || 0) - staged;
  }
}
