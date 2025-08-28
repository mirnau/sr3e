// services/shopping/AttributeKarmaShopping.js
import { writable, derived, get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

// If you later want to allow beyond-RML up to Attribute Maximum (≈1.5×RML),
// change max to attributeMaximumFromRML(rml) here and keep the cost rule.
function attributeMaximumFromRML(rml) {
  if (rml == null) return null;
  return Math.floor(rml * 1.5);
}

export default class AttributeKarmaShopping extends BaseAttributeShopping {
  constructor({ actor, key, storeManager, rml, disallowRaise, isShoppingStateStore }) {
    // Hard-cap at RML for now (no over-RML buying in karma sessions)
    const max = rml ?? null;
    super({ actor, key, storeManager, rml, max, disallowRaise });

    this.goodKarma = storeManager.GetRWStore("karma.goodKarma");
    this.spentKarma = storeManager.GetRWStore("karma.spentKarma");

    this.isShoppingStateStore = isShoppingStateStore;

    // Session state
    this.sessionActive = false;
    this.baselineBase = 0;
    this.baselineGoodKarma = 0;
    this.baselineSpentKarma = 0;

    // Staged values (local to the session)
    this.stagedBase = storeManager.GetShallowStore(actor.id, `karmaSession:${key}:stagedBase`);
    this.stagedSpent = storeManager.GetShallowStore(actor.id, `karmaSession:${key}:stagedSpent`, 0);

    // Use RO mod to compose display sum from staged base
    this.modRO = storeManager.GetROStore(`attributes.${key}.mod`);
    this.displayRO = derived(
      [this.stagedBase, this.modRO],
      ([$b, $m]) => ({ value: $b ?? 0, mod: $m ?? 0, sum: ($b ?? 0) + ($m ?? 0) })
    );

    // React to entering / leaving shopping session
    this._sessionUnsub = this.isShoppingStateStore.subscribe((v) => {
      if (v && !this.sessionActive) {
        this._startSession();
      } else if (!v && this.sessionActive) {
        this._commitAndEndSession();
      }
    });
  }

  dispose() {
    this._sessionUnsub && this._sessionUnsub();
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

    const currentBase = get(this.baseRW);
    if (finalBase !== currentBase) this.baseRW.set(finalBase);

    if (stagedSpent !== 0) {
      this.goodKarma.set(this.baselineGoodKarma - stagedSpent);
      this.spentKarma.set(this.baselineSpentKarma + stagedSpent);
    }

    this.sessionActive = false;
  }

  costForTarget(t) {
    // If you later allow beyond-RML, switch to 3×t for t > rml
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
    if (this.disallowRaise) return false; // reaction / magic / essence not purchasable
    if (!this.withinMax(t)) return false;

    const cost = this.costForTarget(t);
    return this._availableKarma() >= cost;
  }

  _canDecrement() {
    if (!this.sessionActive) return false;
    const cur = this._currentStagedBase();
    return cur > this.baselineBase;
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

    const refund = this.costForTarget(cur);
    const curSpent = get(this.stagedSpent) || 0;

    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(curSpent - refund);
  }
}
