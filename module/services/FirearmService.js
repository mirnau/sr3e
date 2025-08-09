const _phaseShots = new Map();
let _lastPhaseKey = null;

export default class FirearmService {
   static #MODE_TN = { manual: 0, semiauto: 0, fullauto: 2 };

   static #modeKey(w) {
      return String(w?.system?.mode ?? "").toLowerCase();
   }

   static #normalizeMode(m) {
      m = String(m || "").toLowerCase();
      if (m === "bf" || m === "burst" || m === "burstfire") return "burst";
      if (m === "manual" || m === "semiauto" || m === "fullauto" || m === "burst") return m;
      return "manual";
   }

   static #isHeavy(w) {
      return !!(w?.system?.isHeavy || w?.system?.isShotgun);
   }

   static #rc(w) {
      return Number(w?.system?.recoilComp ?? 0) || 0;
   }

   static getDefenseTNAdd(weapon) {
      const mode = this.#modeKey(weapon);
      const perWeapon = weapon?.system?.defense?.tnMods ?? {};
      const v = Number(perWeapon?.[mode]);
      if (!Number.isNaN(v)) return v;
      const base = Number(this.#MODE_TN[mode]);
      return Number.isNaN(base) ? 0 : base;
   }

   static getDefenseTNLabel(weapon) {
      return weapon?.system?.defense?.tnLabel ?? "Weapon difficulty";
   }

   static getPhase() {
      const c = game.combat;
      if (!c) return { round: 0, pass: 0, key: "no-combat" };
      const round = Number(c.getFlag("sr3e", "combatTurn") ?? c.round ?? 0);
      const pass = Number(c.getFlag("sr3e", "initiativePass") ?? 1);
      return { round, pass, key: `${round}:${pass}` };
   }

   static getPhaseShots(attackerId) {
      const { key } = this.getPhase();
      if (key !== _lastPhaseKey) {
         _phaseShots.clear();
         _lastPhaseKey = key;
      }
      const k = `${key}:${attackerId}`;
      return _phaseShots.get(k) ?? 0;
   }

   static bumpPhaseShots(attackerId, count) {
      const { key } = this.getPhase();
      if (key !== _lastPhaseKey) {
         _phaseShots.clear();
         _lastPhaseKey = key;
      }
      const k = `${key}:${attackerId}`;
      const cur = _phaseShots.get(k) ?? 0;
      _phaseShots.set(k, cur + Number(count || 1));
   }

   static inCombat() {
      return !!(game.combat && game.combat.started);
   }

   static getDefenseHintFromAttack(initiatorRoll) {
      const o = initiatorRoll?.options ?? {};
      if (o.type !== "item" || !o.itemId) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
      const actor = ChatMessage.getSpeakerActor(o.speaker);
      const weapon = game.items.get(o.itemId) || actor?.items?.get?.(o.itemId) || null;
      if (!weapon) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
      const tnMod = this.getDefenseTNAdd(weapon);
      const tnLabel = this.getDefenseTNLabel(weapon);
      return { type: "attribute", key: "reaction", tnMod, tnLabel };
   }

   static planFire({ weapon, mode, phaseShotsFired = 0, declaredRounds = null, ammoAvailable = null }) {
      const m = this.#normalizeMode(mode ?? this.#modeKey(weapon));
      const rc = this.#rc(weapon);
      const heavy = this.#isHeavy(weapon);

      let rounds = 1;
      let attackerTNMod = 0;
      let powerDelta = 0;
      let levelDelta = 0;
      let notes = [];

      if (m === "semiauto") {
         const uncomp = Math.max(0, phaseShotsFired - rc);
         attackerTNMod += uncomp;
         rounds = 1;
         notes.push("SA");
      } else if (m === "manual") {
         rounds = 1;
      } else if (m === "fullauto") {
         const maxRounds = 10;
         rounds = Math.min(Math.max(1, Number(declaredRounds ?? maxRounds)), maxRounds);
         if (ammoAvailable != null) rounds = Math.min(rounds, Number(ammoAvailable) || 0);
         const uncomp = Math.max(0, rounds - rc);
         attackerTNMod += uncomp * (heavy ? 2 : 1);
         powerDelta = rounds;
         levelDelta = Math.floor(rounds / 3);
         notes.push(`FA ${rounds}`);
      } else if (m === "burst") {
         const want = 3;
         rounds = ammoAvailable != null ? Math.min(want, Number(ammoAvailable) || 0) : want;
         if (rounds >= 3) {
            const uncomp = Math.max(0, 3 - rc);
            attackerTNMod += uncomp * (heavy ? 2 : 1);
            powerDelta = 3;
            levelDelta = 1;
            notes.push("BF");
         } else if (rounds === 2) {
            const uncomp = Math.max(0, 2 - rc);
            attackerTNMod += uncomp * (heavy ? 2 : 1);
            powerDelta = 2;
            levelDelta = 0;
            notes.push("Short BF");
         } else {
            const uncomp = Math.max(0, phaseShotsFired - rc);
            attackerTNMod += uncomp;
            rounds = 1;
            notes.push("SA");
         }
      } else {
         rounds = 1;
      }

      return { roundsFired: rounds, attackerTNMod, powerDelta, levelDelta, notes };
   }

   static recoilModifierForComposer({ actor, caller, declaredRounds = null, ammoAvailable = null }) {
      if (!this.inCombat()) return null;
      const itemId = caller?.item?.id ?? caller?.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (!weapon) return null;
      const already = this.getPhaseShots(actor?.id);
      const plan = this.planFire({ weapon, phaseShotsFired: already, declaredRounds, ammoAvailable });
      return plan.attackerTNMod ? { id: "recoil", name: "Recoil", value: plan.attackerTNMod } : null;
   }
}
