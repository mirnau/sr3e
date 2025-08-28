import { writable, derived, get } from "svelte/store";
import BaseAttributeShopping from "./BaseAttributeShopping.js";

const TRACE = true;

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

    // Staged values MUST be real Svelte stores to trigger reactivity
    this.stagedBase = writable(0);
    this.stagedSpent = writable(0);

    // Display during session = stagedBase + live mod
    this.modRO = this.storeManager.GetROStore(`attributes.${this.key}.mod`);
    this.displayRO = derived(
      [this.stagedBase, this.modRO],
      ([$b, $m]) => ({ value: $b ?? 0, mod: $m ?? 0, sum: ($b ?? 0) + ($m ?? 0) })
    );

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

    TRACE && console.log(`[KarmaSession:start] key=${this.key} base=${this.baselineBase} goodKarma=${this.baselineGoodKarma}`);
  }

  _commitAndEndSession() {
    const finalBase = get(this.stagedBase);
    const stagedSpent = get(this.stagedSpent);

    if (finalBase !== get(this.baseRW)) this.baseRW.set(finalBase);
    if (stagedSpent !== 0) {
      this.goodKarma.set(this.baselineGoodKarma - stagedSpent);
      this.spentKarma.set(this.baselineSpentKarma + stagedSpent);
    }

    TRACE && console.log(`[KarmaSession:commit] key=${this.key} finalBase=${finalBase} spent=${stagedSpent}`);

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
    if (!this.sessionActive) {
      TRACE && console.log(`[Karma:canUp] false — session inactive`);
      return false;
    }
    if (this.disallowRaise) {
      TRACE && console.log(`[Karma:canUp] false — disallowRaise for ${this.key}`);
      return false;
    }
    if (!this.withinMax(t)) {
      TRACE && console.log(`[Karma:canUp] false — at cap (max=${this.max}) target=${t}`);
      return false;
    }

    const cost = this.costForTarget(t);
    const ok = this._availableKarma() >= cost;
    TRACE && console.log(`[Karma:canUp] ${ok} — next=${t} cost=${cost} available=${this._availableKarma()}`);
    return ok;
  }

  _canDecrement() {
    if (!this.sessionActive) {
      TRACE && console.log(`[Karma:canDown] false — session inactive`);
      return false;
    }
    const cur = this._currentStagedBase();
    const ok = cur > this.baselineBase;
    TRACE && console.log(`[Karma:canDown] ${ok} — staged=${cur} baseline=${this.baselineBase}`);
    return ok;
  }

  _applyIncrement() {
    const next = this._currentStagedBase() + 1;
    if (!this._canIncrement(next)) return;

    const cost = this.costForTarget(next);
    const curSpent = get(this.stagedSpent) || 0;
    const curBase = this._currentStagedBase();

    this.stagedBase.set(curBase + 1);
    this.stagedSpent.set(curSpent + cost);

    TRACE && console.log(`[Karma:up] to ${curBase + 1} (spent +${cost} → ${curSpent + cost})`);
  }

  _applyDecrement() {
    const cur = this._currentStagedBase();
    if (cur <= this.baselineBase) return;

    const refund = this.costForTarget(cur);
    const curSpent = get(this.stagedSpent) || 0;

    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(curSpent - refund);

    TRACE && console.log(`[Karma:down] to ${cur - 1} (refund ${refund} → spent ${curSpent - refund})`);
  }
}
