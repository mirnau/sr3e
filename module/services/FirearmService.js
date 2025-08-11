const _phaseShots = new Map();
let _lastPhaseKey = null;

const _oocShots = new Map();
let _oocWindowMs = 3000;

export default class FirearmService {
   static #weaponModes() {
      const m = CONFIG?.sr3e?.weaponMode;
      if (!m || typeof m !== "object") throw new Error("sr3e: CONFIG.sr3e.weaponMode missing");
      return Object.keys(m);
   }

   static #modeKey(w) {
      const mode = String(w?.system?.mode ?? "");
      const allowed = this.#weaponModes();
      if (!allowed.includes(mode)) throw new Error(`sr3e: Unknown weapon mode "${mode}"`);
      return mode;
   }

   static #isFirearmMode(m) {
      return m === "manual" || m === "semiauto" || m === "burst" || m === "fullauto";
   }

   static #isHeavy(w) {
      return !!w?.system?.isHeavy;
   }

   static #rc(w) {
      return Number(w?.system?.recoilComp ?? 0) || 0;
   }

   static resetRecoil(attackerId) {
      if (!attackerId) throw new Error("sr3e: resetRecoil missing attackerId");
      if (this.inCombat()) {
         const { key } = this.getPhase();
         _phaseShots.delete(`${key}:${attackerId}`);
      } else {
         _oocShots.delete(attackerId);
      }
   }

   static resetAllRecoilForActor(attackerId) {
      if (!attackerId) throw new Error("sr3e: resetAllRecoilForActor missing attackerId");
      // wipe OOC
      _oocShots.delete(attackerId);
      // wipe any in-phase entries for this actor (rarely needed, but handy)
      for (const k of _phaseShots.keys()) {
         if (k.endsWith(`:${attackerId}`)) _phaseShots.delete(k);
      }
   }

   static hasRecoilContext(attackerId) {
      if (!attackerId) return false;
      if (this.inCombat()) {
         const { key } = this.getPhase();
         return (_phaseShots.get(`${key}:${attackerId}`) ?? 0) > 0;
      }
      const s = _oocShots.get(attackerId);
      return !!s && (s.c ?? 0) > 0;
   }

   static getDefenseTNAdd(weapon) {
      const mode = this.#modeKey(weapon);
      const perWeapon = weapon?.system?.defense?.tnMods ?? {};
      if (perWeapon[mode] != null) {
         const v = Number(perWeapon[mode]);
         if (Number.isFinite(v)) return v;
         throw new Error(`sr3e: tnMods[${mode}] NaN`);
      }
      const baseByMode = CONFIG?.sr3e?.defense?.baseTNByMode;
      if (!baseByMode || baseByMode[mode] == null)
         throw new Error(`sr3e: defense.baseTNByMode missing for mode "${mode}"`);
      const base = Number(baseByMode[mode]);
      if (!Number.isFinite(base)) throw new Error(`sr3e: defense.baseTNByMode[${mode}] NaN`);
      return base;
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

   static setOOCWindowMs(ms) {
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
      const now = Date.now();
      const s = this.#oocTouch(attackerId);
      this.#oocResetIfStale(s, now);
      return s.c;
   }

   static bumpOOCShots(attackerId, count) {
      const now = Date.now();
      const s = this.#oocTouch(attackerId);
      this.#oocResetIfStale(s, now);
      s.c += Number(count || 1);
      s.t = now;
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

   static #recoilTotal({ before, add, rc, heavy, shotgunBF }) {
      let total = Math.max(0, before + add - rc);
      if (total > 0 && (heavy || shotgunBF)) total *= 2;
      return total;
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
         const add = phaseShotsFired > 0 ? 1 : 0; // <- only second SA shot adds recoil
         rounds = 1;
         attackerTNMod = this.#recoilTotal({ before: phaseShotsFired, add, rc, heavy });
         notes.push("SA");
      } else if (m === "manual") {
         rounds = 1;
      } else if (m === "fullauto") {
         const maxRounds = 10;
         rounds = Math.min(Math.max(1, Number(declaredRounds ?? maxRounds)), maxRounds);
         if (ammoAvailable != null) rounds = Math.min(rounds, Number(ammoAvailable) || 0);
         attackerTNMod = this.#recoilTotal({ before: phaseShotsFired, add: rounds, rc, heavy });
         powerDelta = rounds;
         levelDelta = Math.floor(rounds / 3);
         notes.push(`FA ${rounds}`);
      } else if (m === "burst") {
         const want = 3;
         rounds = ammoAvailable != null ? Math.min(want, Number(ammoAvailable) || 0) : want;
         if (rounds >= 2) {
            attackerTNMod = this.#recoilTotal({ before: phaseShotsFired, add: rounds, rc, heavy });
            powerDelta = rounds;
            levelDelta = Math.floor(rounds / 3);
            notes.push(rounds >= 3 ? "BF" : "Short BF");
         } else {
            rounds = 1;
            attackerTNMod = this.#recoilTotal({ before: phaseShotsFired, add: 1, rc, heavy });
            notes.push("SA");
         }
      } else {
         rounds = 1;
      }

      return { roundsFired: rounds, attackerTNMod, powerDelta, levelDelta, notes, mode: m };
   }

   static recoilModifierForComposer({ actor, caller, declaredRounds = 1, ammoAvailable = null }) {
      const itemId = caller?.item?.id ?? caller?.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (!weapon) return null;

      const m = this.#modeKey(weapon);
      const already = this.inCombat() ? this.getPhaseShots(actor?.id) : this.getOOCShots(actor?.id);

      const plan = this.planFire({
         weapon,
         mode: m,
         phaseShotsFired: already,
         declaredRounds,
         ammoAvailable,
      });

      return plan.attackerTNMod ? { id: "recoil", name: "Recoil", value: plan.attackerTNMod } : null;
   }

   static bumpOnShot({ actor, weapon, declaredRounds = 1 }) {
      const m = this.#modeKey(weapon);
      if (!this.#isFirearmMode(m)) return;
      if (this.inCombat()) this.bumpPhaseShots(actor?.id, declaredRounds);
      else this.bumpOOCShots(actor?.id, declaredRounds);
   }

   /**
    * Return actor-owned ammo items compatible with this weapon.
    * Compatibility rule of thumb:
    * - type: "ammunition"
    * - equipped flag true
    * - matching class/caliber/etc. as needed
    */
   static findCompatibleAmmo(actor, weapon) {
      const needClass = weapon.system.ammunitionClass?.trim().toLowerCase();
      const items = actor.items.filter((i) => i.type === "ammunition");

      // NOTE: tune these matchers to your ammo schema. `rounds` and `class`
      // are already present in i18n/config, which mirrors your item data.
      const compat = items.filter((i) => {
         const isEquipped = !!i.getFlag("sr3e", "isEquipped");
         const cls = i.system?.ammunition?.class ?? i.system?.class ?? i.system?.ammunitionClass;
         const rounds = i.system?.ammunition?.rounds ?? i.system?.rounds ?? 0;
         return isEquipped && rounds > 0 && (needClass ? String(cls).toLowerCase() === needClass : true);
      });

      return compat;
   }

   /**
    * Set weapon.system.ammoId to the chosen magazine and announce it.
    * If there are multiple compatible mags, prompt the user.
    * If none, warn.
    */
   static async reloadWeapon(actor, weapon) {
      const needClass = String(weapon.system?.ammunitionClass ?? "").trim();
      const compat = this.findCompatibleAmmo(actor, weapon);

      const chosen = await this.pickAmmoDialog(compat, weapon, { needClass, allowEmpty: true });
      if (chosen === null) return; // user cancelled

      if (chosen === "__EMPTY__") {
         await this.ejectMagazine(actor, weapon, { silent: true });
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<b>${actor.name}</b> leaves <i>${weapon.name}</i> unloaded.`,
         });
         return;
      }

      await weapon.update({ "system.ammoId": chosen.id });
      await ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor }),
         content: `<b>${actor.name}</b> reloads <i>${weapon.name}</i> with <i>${chosen.name}</i>.`,
      });
   }

   /**
    * Clear the current mag from the weapon — leaves the ammo item in inventory.
    * Useful for explicit "eject" UX or when a mag hits 0.
    */
   static async ejectMagazine(actor, weapon, { silent = false } = {}) {
      const currentId = weapon.system?.ammoId;
      if (!currentId) return;

      const mag = actor.items.get(currentId);
      await weapon.update({ "system.ammoId": "" });

      if (!silent) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<b>${actor.name}</b> ejects the magazine from <i>${weapon.name}</i>.`,
         });
      }
   }

   /**
    * Consume N rounds from the currently attached mag.
    * If the mag disappears or hits 0, auto-eject (and require a reload next time).
    */

   static async consumeAmmo(actor, weapon, roundsToSpend = 1) {
      const magId = weapon.system?.ammoId;
      if (!magId) return { ok: false, reason: "no-mag" };

      const mag = actor.items.get(magId);
      if (!mag) {
         await weapon.update({ "system.ammoId": "" });
         return { ok: false, reason: "mag-missing" };
      }

      const current = mag.system?.ammunition?.rounds ?? mag.system?.rounds ?? 0;
      if (current <= 0) {
         await this.ejectMagazine(actor, weapon, { silent: true }); // ← was ejectMagazine
         return { ok: false, reason: "empty" };
      }

      const newCount = Math.max(0, current - roundsToSpend);
      if (mag.system?.ammunition) await mag.update({ "system.ammunition.rounds": newCount });
      else await mag.update({ "system.rounds": newCount });

      if (newCount === 0) await this.ejectMagazine(actor, weapon, { silent: true }); // ← was ejectMagazine
      return { ok: true, remaining: newCount };
   }

   // —————— UI helper ——————
   // FirearmService
   static async pickAmmoDialog(ammoItems, weapon, { needClass = "", allowEmpty = false } = {}) {
      const emptyLabel = game.i18n.localize("sr3e.ammunition.empty") || "— Unloaded / Empty —";
      const roundsKey = game.i18n.localize("sr3e.ammunition.rounds") || "rounds";
      const ammoKey = game.i18n.localize("sr3e.ammunition.ammunition") || "Ammunition";

      const options = [];
      if (allowEmpty) {
         options.push(`<option value="__EMPTY__">${emptyLabel}</option>`);
      }

      for (const i of ammoItems) {
         const rounds = i.system?.ammunition?.rounds ?? i.system?.rounds ?? 0;
         const cls = i.system?.ammunition?.class ?? i.system?.class ?? i.system?.ammunitionClass ?? "";
         options.push(`<option value="${i.id}">${i.name} — ${rounds} ${roundsKey}${cls ? ` (${cls})` : ""}</option>`);
      }

      const needClassHint = needClass
         ? `<p class="notes"><small>${
              game.i18n.localize("sr3e.ammunition.requiredClass") || "Required class"
           }: <b>${needClass}</b></small></p>`
         : "";

      const content = `
    <div class="form-group">
      <label>${ammoKey}</label>
      <select name="ammoId">${options.join("")}</select>
      ${needClassHint}
    </div>`;

      const result = await foundry.applications.api.DialogV2.prompt({
         window: {
            title: `Reload ${weapon.name}`,
         },
         content,
         ok: {
            label: game.i18n.localize("sr3e.modal.confirm") || "OK",
            callback: (event, button, dialog) => {
               const id = dialog.element.querySelector('select[name="ammoId"]').value;
               if (id === "__EMPTY__") return "__EMPTY__";
               return ammoItems.find((i) => i.id === id);
            },
         },
         cancel: {
            label: game.i18n.localize("sr3e.modal.decline") || "Cancel",
         },
         rejectClose: false,
         modal: true,
      });

      return result;
   }
}