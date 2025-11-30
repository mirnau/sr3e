// ProcedureLock.js
export default class ProcedureLock {
  static PRIORITY = Object.freeze({ simple: 1, advanced: 10 });
  static #lock = null; // { id, ownerKey, priority, tag, ts }

  static current() { return this.#lock; }
  static isLocked() { return !!this.#lock; }
  static hasHigherThan(p) { return this.#lock && this.#lock.priority > p; }

  static acquire({ ownerKey, priority = "advanced", tag = "" } = {}) {
    const pr = typeof priority === "number" ? priority : (this.PRIORITY[String(priority)] ?? 0);
    if (this.#lock && this.#lock.ownerKey !== ownerKey && this.#lock.priority > pr) return null;
    this.#lock = { id: foundry.utils.randomID(8), ownerKey, priority: pr, tag, ts: Date.now() };
    return this.#lock.id;
  }

  static release(ownerOrId) {
    if (!this.#lock) return true;
    if (ownerOrId === this.#lock.ownerKey || ownerOrId === this.#lock.id) { this.#lock = null; return true; }
    return false;
  }

  static assertEnter({ ownerKey, priority = "advanced", onDenied } = {}) {
    const id = this.acquire({ ownerKey, priority });
    if (!id) { onDenied?.(this.#lock); return false; }
    return id;
  }
}
