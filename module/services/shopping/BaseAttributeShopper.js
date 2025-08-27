// AttributeShopper.js
export default class BaseAttributeShopper {
  /** @param {object} ctx */
  constructor(ctx) {
    const { storeManager, actor, key, metatype } = ctx ?? {};
    if (!storeManager || !actor || !key) throw new Error("AttributeShopper: bad ctx");

    this.storeManager = storeManager;
    this.actor = actor;
    this.key = String(key);
    this.metatype = metatype;

    // Natural (unaugmented) value store (read–write)
    this.baseStore = storeManager.GetRWStore(`attributes.${this.key}.value`);
    // Read-only aggregate (value + mods etc.)
    this.roStore = storeManager.GetSumROStore(`attributes.${this.key}`);

    // Limits
    this.rml =
      this.key === "magic" ? 0 : (this.metatype?.system?.attributeLimits?.[this.key] ?? 0);
    this.attrMax = this.rml > 0 ? Math.floor(this.rml * 1.5) : 0;
  }

  /** Overridden by subclasses */
  canIncrease() { return false; }
  canDecrease() { return false; } // only relevant for creation flow
  /** Overridden by subclasses */
  applyDelta(/* +1 or -1 */) { /* noop */ }

  // Helpers
  _currentBase() { return this.roStore?.value ?? 0; } // natural!
  _targetBase(delta) { return this._currentBase() + delta; }
}
