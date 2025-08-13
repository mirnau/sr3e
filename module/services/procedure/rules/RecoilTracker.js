const _phaseShots = new Map();
let _lastPhaseKey = null;

const _oocShots = new Map();
let _oocWindowMs = 3000;

export default class RecoilTracker {
  static inCombat() {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.inCombat.name]);
    return !!(game.combat && game.combat.started);
  }

  static getPhase() {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.getPhase.name]);
    const c = game.combat;
    if (!c) return { round: 0, pass: 0, key: "no-combat" };
    const round = Number(c.getFlag("sr3e", "combatTurn") ?? c.round ?? 0);
    const pass = Number(c.getFlag("sr3e", "initiativePass") ?? 1);
    return { round, pass, key: `${round}:${pass}` };
  }

  static resetRecoil(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.resetRecoil.name]);
    if (!attackerId) throw new Error("sr3e: resetRecoil missing attackerId");
    if (this.inCombat()) {
      const { key } = this.getPhase();
      _phaseShots.delete(`${key}:${attackerId}`);
    } else {
      _oocShots.delete(attackerId);
    }
  }

  static resetAllRecoilForActor(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.resetAllRecoilForActor.name]);
    if (!attackerId) throw new Error("sr3e: resetAllRecoilForActor missing attackerId");
    _oocShots.delete(attackerId);
    for (const k of _phaseShots.keys()) {
      if (k.endsWith(`:${attackerId}`)) _phaseShots.delete(k);
    }
  }

  static hasRecoilContext(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.hasRecoilContext.name]);
    if (!attackerId) return false;
    if (this.inCombat()) {
      const { key } = this.getPhase();
      return (_phaseShots.get(`${key}:${attackerId}`) ?? 0) > 0;
    }
    const s = _oocShots.get(attackerId);
    return !!s && (s.c ?? 0) > 0;
  }

  static getPhaseShots(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.getPhaseShots.name]);
    const { key } = this.getPhase();
    if (key !== _lastPhaseKey) {
      _phaseShots.clear();
      _lastPhaseKey = key;
    }
    const k = `${key}:${attackerId}`;
    return _phaseShots.get(k) ?? 0;
  }

  static bumpPhaseShots(attackerId, count) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.bumpPhaseShots.name]);
    const { key } = this.getPhase();
    if (key !== _lastPhaseKey) {
      _phaseShots.clear();
      _lastPhaseKey = key;
    }
    const k = `${key}:${attackerId}`;
    const cur = _phaseShots.get(k) ?? 0;
    _phaseShots.set(k, cur + Number(count || 1));
  }

  static setOOCWindowMs(ms) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.setOOCWindowMs.name]);
    _oocWindowMs = Math.max(250, Number(ms) || 3000);
  }

  static #oocTouch(attackerId) {
    const s = _oocShots.get(attackerId) ?? { c: 0, t: 0 };
    _oocShots.set(attackerId, s);
    return s;
  }

  static #oocResetIfStale(s, now) {
    if (now - s.t > _oocWindowMs) s.c = 0;
  }

  static getOOCShots(attackerId) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.getOOCShots.name]);
    const now = Date.now();
    const s = this.#oocTouch(attackerId);
    this.#oocResetIfStale(s, now);
    return s.c;
  }

  static bumpOOCShots(attackerId, count) {
    DEBUG && LOG.info("", [__FILE__, __LINE__, RecoilTracker.bumpOOCShots.name]);
    const now = Date.now();
    const s = this.#oocTouch(attackerId);
    this.#oocResetIfStale(s, now);
    s.c += Number(count || 1);
    s.t = now;
  }
}
