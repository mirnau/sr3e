// services/shopping/AttributeKarmaShopping.js
import { writable, derived, get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

function attributeMaximumFromRML(rml) {
  if (rml == null) return null;
  // Attribute Maximum is 1.5 × RML — round up so 5→8, 6→9, etc.
  return Math.ceil(rml * 1.5);
}

export default class AttributeKarmaShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, disallowRaise, isShoppingStateStore }) {
    const max = attributeMaximumFromRML(rml); // hard cap at Attribute Maximum (from RML)
    super({ actor, key, storeManager, rml, max, disallowRaise });

    // Actor resources
    this.goodKarma = storeManager.GetRWStore("karma.goodKarma");
    this.spentKarma = storeManager.GetRWStore("karma.spentKarma");

    // Session wiring
    this.isShoppingStateStore = isShoppingStateStore;
    this.sessionActive = false;
    this.baselineBase = 0;
    this.baselineGoodKarma = 0;
    this.baselineSpentKarma = 0;

    // Staged state (real Svelte stores)
    this.stagedBase = writable(0);
    this.stagedSpent = writable(0);

    // Keep baseline as store so preview recomputes after session start
    this.baselineGoodKarmaRO = writable(0);

    // Display during session = stagedBase + live mod
    this.modRO = this.storeManager.GetROStore(`attributes.${this.key}.mod`);
    this.displayRO = derived(
      [this.stagedBase, this.modRO],
      ([$b, $m]) => ({ value: $b ?? 0, mod: $m ?? 0, sum: ($b ?? 0) + ($m ?? 0) })
    );

    // Chevron booleans as stores → stable, reactive bindings for the UI
    this.canIncrementRO = derived(
      [this.stagedBase, this.goodKarma],
      () => this.computeCanIncrement()
    );
    this.canDecrementRO = derived(
      [this.stagedBase],
      () => this.computeCanDecrement()
    );

    // Live Good Karma preview while staging
    this.goodKarmaDisplayRO = derived(
      [this.isShoppingStateStore, this.baselineGoodKarmaRO, this.stagedSpent, this.goodKarma],
      ([$shopping, $baseline, $stagedSpent, $good]) => {
        if ($shopping) return ($baseline ?? 0) - ($stagedSpent ?? 0);
        return $good ?? 0;
      }
    );

    // Start/commit session on shopping flag changes
    this._sessionUnsub = this.isShoppingStateStore.subscribe((v) => {
      if (v && !this.sessionActive) this._startSession();
      else if (!v && this.sessionActive) this._commitAndEndSession();
    });
  }

  dispose() {
    this._sessionUnsub && this._sessionUnsub();
  }

  // Use STAGED base in Karma mode
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
    this.baselineGoodKarmaRO.set(this.baselineGoodKarma);
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

  // Canonical SR3E costs: 2×t up to RML, 3×t above RML
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
    if (this.disallowRaise) return false;         // reaction / magic / essence not buyable
    if (!this.withinMax(t)) return false;         // hard cap at Attribute Maximum (from RML)
    const cost = this.costForTarget(t);
    return this._availableKarma() >= cost;        // affordability
  }

  _canDecrement() {
    if (!this.sessionActive) return false;
    const cur = this._currentStagedBase();
    return cur > this.baselineBase;               // min is the session baseline
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

    const refund = this.costForTarget(cur);       // cost of the point being removed
    const curSpent = get(this.stagedSpent) || 0;

    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(curSpent - refund);
  }
}
