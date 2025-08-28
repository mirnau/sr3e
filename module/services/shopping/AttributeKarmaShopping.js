import { writable, derived, get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

function attributeMaximumFromRML(rml) {
  if (rml == null) return null;
  return Math.floor(rml * 1.5);
}

export default class AttributeKarmaShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, disallowRaise, isShoppingStateStore }) {
    const max = attributeMaximumFromRML(rml);
    super({ actor, key, storeManager, rml, max, disallowRaise });

    this.goodKarma = storeManager.GetRWStore("karma.goodKarma");
    this.spentKarma = storeManager.GetRWStore("karma.spentKarma");
    this.isShoppingStateStore = isShoppingStateStore;

    this.sessionActive = false;
    this.baselineBase = 0;
    this.baselineGoodKarma = 0;
    this.baselineSpentKarma = 0;

    // Use REAL Svelte stores for staging (not StoreManager shallow stores)
    this.stagedBase = writable(0);
    this.stagedSpent = writable(0);

    // Display during session = stagedBase + live mod
    this.modRO = storeManager.GetROStore(`attributes.${key}.mod`);
    this.displayRO = derived(
      [this.stagedBase, this.modRO],
      ([$b, $m]) => ({ value: $b ?? 0, mod: $m ?? 0, sum: ($b ?? 0) + ($m ?? 0) })
    );

    // Start/commit when shopping flag flips
    this._sessionUnsub = this.isShoppingStateStore.subscribe((v) => {
      if (v && !this.sessionActive) this._startSession();
      else if (!v && this.sessionActive) this._commitAndEndSession();
    });
  }

  dispose() {
    this._sessionUnsub && this._sessionUnsub();
  }

  // IMPORTANT: next target must be based on staged base in Karma sessions
  nextTarget() {
    return this._currentStagedBase() + 1;
  }

  _startSession() {
    this.sessionActive = true;
    this.baselineBase = get(this.baseRW);
    this.baselineGoodKarma = get(this.goodKarma);
    this.baselineSpentKarma = get(this.spentKarma);
    this.stagedBase.set(this.baselineBase);
    this.stagedSpent.set(0);
  }

  _commitAndEndSession() {
    const finalBase = get(this.stagedBase);
    const stagedSpent = get(this.stagedSpent);

    if (finalBase !== get(this.baseRW)) this.baseRW.set(finalBase);
    if (stagedSpent !== 0) {
      this.goodKarma.set(this.baselineGoodKarma - stagedSpent);
      this.spentKarma.set(this.baselineSpentKarma + stagedSpent);
    }

    this.sessionActive = false;
  }

  // Canon: 2×t up to RML, 3×t above RML
  costForTarget(t) {
    if (this.rml != null && t > this.rml) return 3 * t;
    return 2 * t;
  }

  _availableKarma() {
    const staged = get(this.stagedSpent) || 0;
    return this.baselineGoodKarma - staged;
  }

  _currentStagedBase() {
    return get(this.stagedBase) ?? this.baselineBase;
  }

  _canIncrement(t) {
    if (!this.sessionActive) return false;
    if (this.disallowRaise) return false; // reaction / magic / essence
    if (!this.withinMax(t)) return false;

    const cost = this.costForTarget(t);
    return this._availableKarma() >= cost;
  }

  _canDecrement() {
    if (!this.sessionActive) return false;
    return this._currentStagedBase() > this.baselineBase;
  }

  _applyIncrement() {
    const next = this._currentStagedBase() + 1;
    if (!this._canIncrement(next)) return;

    const cost = this.costForTarget(next);
    const curSpent = get(this.stagedSpent) || 0;
    const curBase = this._currentStagedBase();

    this.stagedBase.set(curBase + 1);
    this.stagedSpent.set(curSpent + cost);
  }

  _applyDecrement() {
    const cur = this._currentStagedBase();
    if (cur <= this.baselineBase) return;

    const refund = this.costForTarget(cur); // cost of the pip being removed
    const curSpent = get(this.stagedSpent) || 0;

    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(curSpent - refund);
  }
}
