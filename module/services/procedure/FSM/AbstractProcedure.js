import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
import { writable, derived, get, readable } from "svelte/store";
import { localize } from "@services/utilities.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";

function C() {
   return CONFIG?.sr3e || {};
}

export default class AbstractProcedure {
   #caller;
   #item;
   #isDefaulting = false;

   #subSkill = null;
   #specialization = null;
   #readwrite = null;
   #contestIds = [];

   #targetNumberStore;
   #modifiersArrayStore;
   #titleStore;
   #linkedAttributeStore;
   #currentDicePoolStore;
   #diceStore;
   #modifiersTotalStore;
   #finalTNStore;
   #difficultyStore;
   #disposers = [];
   #hasTargetsStore = readable(false, (set) => {
      const update = () => set((game.user?.targets?.size ?? 0) > 0);
      Hooks.on("targetToken", update);
      update(); // initial
      return () => Hooks.off("targetToken", update);
   });

   constructor(caller = null, item = null) {
      if (this.constructor === AbstractProcedure) {
         DEBUG && LOG.error("Cannot instantiate abstract class AbstractProcedure", [__FILE__, __LINE__]);
         ui.notifications.warn("Cannot instantiate abstract class AbstractProcedure");
      } else {
         this.#targetNumberStore = writable(4);
         this.#modifiersArrayStore = writable([]);
         this.#titleStore = writable("Roll");
         this.#diceStore = writable(0);
         this.#linkedAttributeStore = writable(null);
         this.#currentDicePoolStore = writable(0);
         this.#modifiersTotalStore = derived(this.#modifiersArrayStore, (arr = []) =>
            arr.reduce((a, m) => a + (Number(m?.value) || 0), 0)
         );
         this.#finalTNStore = derived([this.#targetNumberStore, this.#modifiersTotalStore], ([base, add]) =>
            Math.max(2, Number(base ?? 4) + Number(add ?? 0))
         );
         this.#difficultyStore = derived(this.#targetNumberStore, (tn) => {
            if (tn == null) return "";
            const n = Number(tn);
            const d = C().difficulty || {};
            if (n === 2) return d.simple || "";
            if (n === 3) return d.routine || "";
            if (n === 4) return d.average || "";
            if (n === 5) return d.challenging || "";
            if (n === 6 || n === 7) return d.hard || "";
            if (n === 8) return d.strenuous || "";
            if (n === 9) return d.extreme || "";
            if (n >= 10) return d.nearlyimpossible || "";
            return "";
         });
      }

      if (caller && item) {
         this.#caller = caller;
         this.#item = item;

         this.#titleStore.set(item.name);

         const itemStoreManager = StoreManager.Subscribe(this.#item);
         const actorStoreManager = StoreManager.Subscribe(this.#caller);

         const linkedSkillIdStore = itemStoreManager.GetRWStore("linkedSkillId");
         const [skillId, specIndexRaw] = String(get(linkedSkillIdStore) ?? "").split("::");
         const skill = this.#caller.items.get(skillId);

         const subType = skill?.system?.skillType;
         const subTypeData = subType ? skill.system?.[`${subType}Skill`] ?? {} : {};
         const specializationArray = subTypeData?.specializations ?? [];
         this.#linkedAttributeStore.set(subTypeData.linkedAttribute ?? null);

         const specIndex = Number.parseInt(specIndexRaw);
         this.#specialization = Number.isFinite(specIndex) ? specializationArray[specIndex] : null;

         const baseDice = Number(this.#specialization?.value ?? subTypeData?.value ?? 0) || 0;
         this.#diceStore.set(baseDice);

         if (subType === "active") {
            this.#currentDicePoolStore = actorStoreManager.GetSumROStore(`dicePools.${subTypeData.associatedDicePool}`);
         } else if (subType === "language") {
            this.#readwrite = subTypeData.readwrite;
         }

         this.#subSkill = subTypeData;

         DEBUG &&
            !item.system.isDefaulting &&
            LOG.error(`Item ${item.type}, ${item.name} has no isDefaulting property`, [__FILE__, __LINE__]);

         this.#isDefaulting = !!this.#item.system.isDefaulting;

         if (this.#isDefaulting) {
            if (this.#specialization) {
               this.defaultFromSkillToSpecialization();
            } else if (this.#subSkill?.value > 0) {
               this.defaultFromSkillToSkill();
            } else {
               this.defaultFromSkillToAttribute();
            }
         }

         StoreManager.Unsubscribe(this.#caller);
         StoreManager.Unsubscribe(this.#item);

         const penaltyStore = StoreManager.Subscribe(this.#caller).GetRWStore("health.penalty");
         const unsubPenalty = penaltyStore.subscribe((p) => {
            const v = Number(p ?? 0);
            this._removeModById("penalty");
            if (v > 0) this.upsertMod({ id: "penalty", name: localize(C().health?.penalty), value: -v });
         });
         this.#disposers.push(unsubPenalty);
      }
   }

   get hasTargetsStore() {
      return this.#hasTargetsStore;
   }

   get linkedAttribute() {
      return get(this.#linkedAttributeStore);
   }

   get caller() {
      return this.#caller;
   }
   get item() {
      return this.#item;
   }

   set title(v) {
      this.#titleStore?.set?.(v);
   }
   get title() {
      return this.#titleStore;
   }

   get modifiersArrayStore() {
      DEBUG && !this.#modifiersArrayStore && LOG.error("Modifiers has not been set", [__FILE__, __LINE__]);
      return this.#modifiersArrayStore;
   }

   get targetNumber() {
      return this.#targetNumberStore;
   }

   get modifiersTotal() {
      return this.#modifiersTotalStore;
   }

   get finalTNStore() {
      return this.#finalTNStore;
   }

   get difficultyStore() {
      return this.#difficultyStore;
   }

   get dice() {
      return Number(get(this.#diceStore) ?? 0) || 0;
   }
   set dice(v) {
      this.#diceStore.set(Math.max(0, Number(v) || 0));
   }
   get diceStore() {
      return this.#diceStore;
   }

   get isDefaulting() {
      return this.#isDefaulting;
   }

   get contestIds() {
      return this.#contestIds.slice();
   }

   get isOpposed() {
      return (game.user?.targets?.size ?? 0) > 0;
   }

   setContestIds(ids = []) {
      this.#contestIds = Array.from(ids).filter(Boolean);
   }
   appendContestId(id) {
      if (id) this.#contestIds.push(id);
   }
   clearContests() {
      this.#contestIds = [];
   }

   isCaller(actor) {
      return actor?.id === this.#caller?.id;
   }

   upsertMod(mod) {
      const arr = get(this.#modifiersArrayStore) ?? [];
      const idx = arr.findIndex((m) => (mod.id && m.id === mod.id) || (!mod.id && m.name === mod.name));
      if (idx === -1) this.#modifiersArrayStore.set([...arr, mod]);
      else {
         const copy = arr.slice();
         copy[idx] = { ...copy[idx], ...mod };
         this.#modifiersArrayStore.set(copy);
      }
   }

   removeModByIndex(i) {
      const arr = get(this.#modifiersArrayStore) ?? [];
      if (i < 0 || i >= arr.length) return;
      this.#modifiersArrayStore.set(arr.filter((_, j) => j !== i));
   }

   _removeModById(id) {
      this.#modifiersArrayStore.update((arr = []) => arr.filter((m) => m.id !== id));
   }

   markModTouchedAt(index) {
      const arr = get(this.#modifiersArrayStore) ?? [];
      if (index < 0 || index >= arr.length) return;
      const copy = arr.slice();
      const m = copy[index] || {};
      copy[index] = { ...m, meta: { ...(m.meta || {}), userTouched: true } };
      this.#modifiersArrayStore.set(copy);
   }

   finalTN({ floor = null } = {}) {
      const mods = get(this.#modifiersArrayStore) ?? [];
      const base = Number(get(this.#targetNumberStore) ?? 4);
      const sum = mods.reduce((a, m) => a + (Number(m?.value) || 0), base);
      return floor == null ? sum : Math.max(floor, sum);
   }

   buildFormula(explodes = true) {
      const dice = this.dice;
      if (dice <= 0) return "1d6";

      const base = `${dice}d6`;
      if (!explodes) return base;

      const tnBase = get(this.#targetNumberStore);
      const isOpen = this.#isOpenTest() || tnBase == null;
      if (isOpen) return `${base}x`;

      const tn = this.finalTN();
      return `${base}x${Math.max(2, Number(tn) || 2)}`;
   }

   onDestroy() {
      for (const d of this.#disposers) {
         try {
            d?.();
         } catch {}
      }
      this.#disposers = [];
   }

   /**
    * Generic contested roll entry point used by Challenge.svelte
    */
   async challenge({ OnClose, CommitEffects } = {}) {
      try {
         OnClose?.();

         const actor = this.caller;
         const formula = this.buildFormula(true);
         const baseRoll = SR3ERoll.create(formula, { actor });

         await this.onChallengeWillRoll?.({ baseRoll, actor });

         // <<< pass the procedure instance instead of options >>>
         const roll = await baseRoll.evaluate(this);
         await baseRoll.waitForResolution();

         await CommitEffects?.();

         // Expire all contests recorded on the procedure, then clear
         if (this.#contestIds?.length) {
            for (const id of this.#contestIds) OpposeRollService.expireContest(id);
            this.clearContests();
         }

         Hooks.callAll("actorSystemRecalculated", actor);
         await this.onChallengeResolved?.({ roll, actor });
         return roll;
      } catch (err) {
         DEBUG && LOG.error("Challenge flow failed", [__FILE__, __LINE__, err]);
         ui.notifications.error(game.i18n.localize?.("sr3e.error.challengeFailed") ?? "Challenge failed");
         throw err;
      }
   }

   /** Optional hook: run just before the roll is evaluated. Subclasses may override. */
   async onChallengeWillRoll(/* { baseRoll, actor } */) {}

   /** Optional hook: run after the roll is fully resolved. Subclasses may override. */
   async onChallengeResolved(/* { roll, actor } */) {}

   #clearDefaultingMods() {
      this.#modifiersArrayStore.update((arr = []) =>
         arr.filter((m) => !String(m?.id || "").startsWith("auto-default-"))
      );
   }

   #upsertMod(mod) {
      this.#modifiersArrayStore.update((arr = []) => {
         const i = arr.findIndex((m) => m.id === mod.id);
         if (i >= 0) {
            const next = arr.slice();
            next[i] = { ...next[i], ...mod };
            return next;
         }
         return [...arr, mod];
      });
   }

   #preDefaultTN() {
      const base = Number(get(this.#targetNumberStore) ?? 4);
      const mods = get(this.#modifiersArrayStore) ?? [];
      const add = mods
         .filter((m) => !String(m?.id || "").startsWith("auto-default-"))
         .reduce((a, m) => a + (Number(m?.value) || 0), 0);
      return base + add;
   }

   #assertDefaultAllowed() {
      if (this.#item?.system?.noDefault) {
         DEBUG && LOG.warn("Defaulting not allowed for this test", [__FILE__, __LINE__]);
         ui.notifications.warn(localize("sr3e.warn.defaultNotAllowed"));
         return false;
      }
      if (this.#preDefaultTN() >= 8) {
         DEBUG && LOG.warn("Defaulting disallowed at TN ≥ 8 before defaulting", [__FILE__, __LINE__]);
         ui.notifications.warn(localize("sr3e.warn.defaultTN8"));
         return false;
      }
      return true;
   }

   #isOpenTest() {
      return this.#item?.system?.openTest === true || this.#item?.system?.testType === "open";
   }

   defaultFromSkillToAttribute() {
      if (!this.#assertDefaultAllowed()) return;
      this.#clearDefaultingMods();
      const isOpen = this.#isOpenTest();
      const mod = {
         id: "auto-default-attr",
         name: "Skill to attribute",
         value: isOpen ? 0 : 4,
         openSubtract: isOpen ? 4 : undefined,
         poolCap: 0,
         forbidPool: true,
      };
      this.#upsertMod(mod);
   }

   defaultFromSkillToSkill() {
      if (!this.#assertDefaultAllowed()) return;
      const rating = Number(this.#subSkill?.value ?? 0);
      DEBUG &&
         (!Number.isFinite(rating) || rating <= 0) &&
         LOG.error("No base skill to default to", [__FILE__, __LINE__]);
      this.#clearDefaultingMods();
      const isOpen = this.#isOpenTest();
      const cap = Math.floor(rating / 2);
      const mod = {
         id: "auto-default-skill",
         name: "Skill to skill",
         value: isOpen ? 0 : 2,
         openSubtract: isOpen ? 2 : undefined,
         poolCap: cap,
      };
      this.#upsertMod(mod);
   }

   defaultFromSkillToSpecialization() {
      if (!this.#assertDefaultAllowed()) return;
      const baseRating = Number(this.#subSkill?.value ?? 0);
      DEBUG &&
         (!Number.isFinite(baseRating) || baseRating <= 0) &&
         LOG.error("No related base skill for specialization default", [__FILE__, __LINE__]);
      this.#clearDefaultingMods();
      const isOpen = this.#isOpenTest();
      const cap = Math.floor(baseRating / 2);
      const mod = {
         id: "auto-default-spec",
         name: "Skill to specialization",
         value: isOpen ? 0 : 3,
         openSubtract: isOpen ? 3 : undefined,
         poolCap: cap,
      };
      this.#upsertMod(mod);
   }
}
