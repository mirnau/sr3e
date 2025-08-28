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
    if (typeof DEBUG !== "undefined" && DEBUG && typeof LOG !== "undefined") {
      LOG.info?.(`KarmaShopping init: key=${key}, rml=${rml}, max=${max}`, [__FILE__, __LINE__]);
    }

    // Actor resources
    this.goodKarma = storeManager.GetRWStore("karma.goodKarma");
    this.spentKarma = storeManager.GetRWStore("karma.spentKarma");

    // Shared session aggregator across all attribute cards for this actor
    this.sessionKarma = storeManager.GetShallowStore(actor.id, "shoppingKarmaSession", {
      active: false,
      baseline: 0,
      stagedSpent: 0,
    });
    // Attribute preview aggregator for derived stats (reaction, dice pools)
    this.previewStore = storeManager.GetShallowStore(actor.id, "shoppingAttributePreview", { active: false, values: {} });
    this._previewUnsub = null;

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
      [this.stagedBase, this.sessionKarma],
      () => this.computeCanIncrement()
    );
    this.canDecrementRO = derived(
      [this.stagedBase],
      () => this.computeCanDecrement()
    );

    // Live Good Karma preview while staging (aggregated across attributes)
    this.goodKarmaDisplayRO = derived(
      [this.isShoppingStateStore, this.sessionKarma, this.goodKarma],
      ([$shopping, $session, $good]) => {
        if ($shopping && $session?.active) return ($session.baseline ?? 0) - ($session.stagedSpent ?? 0);
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
    // If sheet is closing mid-session, prefer rollback over implicit commit
    if (this.sessionActive) this.rollback();
    this._sessionUnsub && this._sessionUnsub();
  }

  commit() {
    if (this.sessionActive) this._commitAndEndSession();
  }

  rollback() {
    if (!this.sessionActive) return;
    // Discard staged changes and end session without writing
    this.stagedBase.set(this.baselineBase);
    this.stagedSpent.set(0);
    // Reset shared aggregator if we own it or are last active
    const sess = get(this.sessionKarma);
    if (sess?.active) this.sessionKarma.set({ active: false, baseline: 0, stagedSpent: 0 });
    this.sessionActive = false;
  }

  // Use STAGED base in Karma mode
  nextTarget() {
    return this._currentStagedBase() + 1;
  }

  _startSession() {
    this.sessionActive = true;
    this.baselineBase = get(this.baseRW);
    const sess = get(this.sessionKarma);
    if (!sess?.active) {
      const baseline = get(this.goodKarma);
      this.sessionKarma.set({ active: true, baseline, stagedSpent: 0 });
      this.baselineGoodKarma = baseline;
    } else {
      this.baselineGoodKarma = sess.baseline ?? get(this.goodKarma);
    }
    this.baselineSpentKarma = get(this.spentKarma);

    this.stagedBase.set(this.baselineBase);
    this.stagedSpent.set(0);
    this.baselineGoodKarmaRO.set(this.baselineGoodKarma);

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
    const finalBase = get(this.stagedBase);
    const stagedSpent = get(this.stagedSpent);

    if (finalBase !== get(this.baseRW)) this.baseRW.set(finalBase);
    // Only one strategy should write the aggregated karma changes
    const sess = get(this.sessionKarma);
    if (sess?.active) {
      const totalSpent = Number(sess.stagedSpent || 0);
      if (totalSpent > 0) {
        this.goodKarma.set((sess.baseline ?? this.baselineGoodKarma) - totalSpent);
        this.spentKarma.set(this.baselineSpentKarma + totalSpent);
      }
      // reset aggregator
      this.sessionKarma.set({ active: false, baseline: 0, stagedSpent: 0 });
    }

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

  // Canonical SR3E costs: 2×t up to RML, 3×t above RML
  costForTarget(t) {
    if (this.rml != null && t > this.rml) return 3 * t;
    return 2 * t;
  }

  _availableKarma() {
    const sess = get(this.sessionKarma) || { baseline: this.baselineGoodKarma, stagedSpent: 0 };
    return (sess.baseline ?? this.baselineGoodKarma) - (sess.stagedSpent ?? 0);
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
    // Update shared session spend
    const sess = get(this.sessionKarma) || { active: true, baseline: this.baselineGoodKarma, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, stagedSpent: (sess.stagedSpent || 0) + cost });
  }

  _applyDecrement() {
    const cur = this._currentStagedBase();
    if (cur <= this.baselineBase) return;

    const refund = this.costForTarget(cur);       // cost of the point being removed
    const curSpent = get(this.stagedSpent) || 0;

    this.stagedBase.set(cur - 1);
    this.stagedSpent.set(curSpent - refund);
    // Update shared session spend
    const sess = get(this.sessionKarma) || { active: true, baseline: this.baselineGoodKarma, stagedSpent: 0 };
    this.sessionKarma.set({ ...sess, stagedSpent: Math.max(0, (sess.stagedSpent || 0) - refund) });
  }
}
