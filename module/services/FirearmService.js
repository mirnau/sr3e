const _phaseShots = new Map();
let _lastPhaseKey = null;

export default class FirearmService {
   static #MODE_TN = { manual: 0, semiauto: 0, burst: 0, fullauto: 2 };

   static #modeKey(w) {
      return w?.system?.mode ?? "manual";
   }

   static #isHeavy(w) {
      return !!(w?.system?.isHeavy || w?.system?.isShotgun);
   }

   static #rc(w) {
      return Number(w?.system?.recoilComp ?? 0) || 0;
   }

   // --- Combat phase helpers ---
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

   // --- Defense TN helpers ---
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

   static getDefenseHintFromAttack(initiatorRoll) {
      const o = initiatorRoll?.options ?? {};
      if (o.type !== "item" || !o.itemId) {
         return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
      }
      const actor = ChatMessage.getSpeakerActor(o.speaker);
      const weapon = game.items.get(o.itemId) || actor?.items?.get?.(o.itemId) || null;
      if (!weapon) return { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "" };
      const tnMod = this.getDefenseTNAdd(weapon);
      const tnLabel = this.getDefenseTNLabel(weapon);
      return { type: "attribute", key: "reaction", tnMod, tnLabel };
   }

   // --- Core recoil logic ---
   static #recoilDelta({ before, add, rc, heavy }) {
      const mult = heavy ? 2 : 1;
      const uncompBefore = Math.max(0, before - rc);
      const uncompAfter = Math.max(0, before + add - rc);
      return (uncompAfter - uncompBefore) * mult;
   }

   static planFire({ weapon, mode, phaseShotsFired = 0, declaredRounds = null, ammoAvailable = null }) {
      const m = mode ?? this.#modeKey(weapon);
      const rc = this.#rc(weapon);
      const heavy = this.#isHeavy(weapon);

      let rounds = 1;
      let attackerTNMod = 0;
      let powerDelta = 0;
      let levelDelta = 0;
      let notes = [];

      if (m === "semiauto") {
         // First shot no recoil, second shot in same pass = +1 recoil
         const add = phaseShotsFired === 0 ? 0 : 1;
         rounds = 1;
         attackerTNMod += this.#recoilDelta({ before: phaseShotsFired, add, rc, heavy });
         notes.push("SA");
      } else if (m === "manual") {
         rounds = 1;
         notes.push("Manual");
      } else if (m === "burst") {
         // Default 3-round burst unless ammo short
         const want = 3;
         rounds = ammoAvailable != null ? Math.min(want, Number(ammoAvailable) || 0) : want;

         if (rounds >= 3) {
            attackerTNMod += this.#recoilDelta({ before: phaseShotsFired, add: 3, rc, heavy });
            powerDelta = 3;
            levelDelta = 1;
            notes.push("BF");
         } else if (rounds === 2) {
            attackerTNMod += this.#recoilDelta({ before: phaseShotsFired, add: 2, rc, heavy });
            powerDelta = 2;
            levelDelta = 0;
            notes.push("Short BF");
         } else {
            // Single fallback shot
            attackerTNMod += this.#recoilDelta({ before: phaseShotsFired, add: 1, rc, heavy });
            notes.push("SA");
         }
      } else if (m === "fullauto") {
         const maxRounds = 10;
         rounds = Math.min(Math.max(1, Number(declaredRounds ?? maxRounds)), maxRounds);
         if (ammoAvailable != null) rounds = Math.min(rounds, Number(ammoAvailable) || 0);

         // +1 recoil per round fired this phase (cumulative)
         attackerTNMod += this.#recoilDelta({ before: phaseShotsFired, add: rounds, rc, heavy });
         powerDelta = rounds;
         levelDelta = Math.floor(rounds / 3);
         notes.push(`FA ${rounds}`);
      } else {
         rounds = 1;
         notes.push("Other");
      }

      return { roundsFired: rounds, attackerTNMod, powerDelta, levelDelta, notes };
   }

   static getRecoilModifier({ actor, caller, declaredRounds = 1, ammoAvailable = null, preview = true }) {
      if (!caller || caller.type !== "item") return null;
      if (this.inCombat()) {
         return this.recoilModifierInCombat({ actor, caller, declaredRounds, ammoAvailable, bump: !preview });
      } else {
         // Outside of combat we track nothing, so roundsFiredSoFar is always 0 for preview
         return this.recoilModifierOutOfCombat({ actor, caller, declaredRounds, ammoAvailable, roundsFiredSoFar: 0 });
      }
   }

   static clearRecoilTracking() {
      _phaseShots.clear();
      _lastPhaseKey = null;
   }

   // --- Pure recoil calculation (no state mutation) ---
   static calculateRecoil({ weapon, roundsFiredSoFar = 0, declaredRounds = 1, ammoAvailable = null }) {
      const plan = this.planFire({
         weapon,
         phaseShotsFired: roundsFiredSoFar,
         declaredRounds,
         ammoAvailable,
      });

      const rc = this.#rc(weapon);
      const heavy = this.#isHeavy(weapon);
      const uncompensated = Math.max(0, roundsFiredSoFar + plan.roundsFired - rc);
      const tnMod = uncompensated * (heavy ? 2 : 1);

      return { tnMod, plan };
   }

   // --- In-combat recoil (tracks shots) ---
   static recoilModifierInCombat({ actor, caller, declaredRounds = 1, ammoAvailable = null, bump = false }) {
      const itemId = caller?.item?.id ?? caller?.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (!weapon) return null;

      const { key: phaseKey } = this.getPhase();
      if (phaseKey !== _lastPhaseKey) {
         _phaseShots.clear();
         _lastPhaseKey = phaseKey;
      }

      const alreadyFired = this.getPhaseShots(actor?.id) || 0;
      const { tnMod, plan } = this.calculateRecoil({
         weapon,
         roundsFiredSoFar: alreadyFired,
         declaredRounds,
         ammoAvailable,
      });

      if (bump) this.bumpPhaseShots(actor?.id, plan.roundsFired);

      return tnMod ? { id: "recoil", name: "Recoil", value: tnMod } : null;
   }

   // --- Out-of-combat recoil (manual round count) ---
   static recoilModifierOutOfCombat({ actor, caller, declaredRounds = 1, ammoAvailable = null, roundsFiredSoFar = 0 }) {
      const itemId = caller?.item?.id ?? caller?.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (!weapon) return null;

      const { tnMod } = this.calculateRecoil({
         weapon,
         roundsFiredSoFar,
         declaredRounds,
         ammoAvailable,
      });

      return tnMod ? { id: "recoil", name: "Recoil", value: tnMod } : null;
   }
}
