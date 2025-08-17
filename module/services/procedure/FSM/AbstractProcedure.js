import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
import { writable, derived, get, readable } from "svelte/store";
import { localize } from "@services/utilities.js";
import SR3ERoll from "@documents/SR3ERoll.js";

function C() {
   return CONFIG?.sr3e || {};
}

export default class AbstractProcedure {
   // ---------- static: serialization registry & helpers ----------
   // ---- Registration (factory) ----
   static #SCHEMA_VERSION = 1;

   // Map: kind -> constructor
   static #registry = new Map();

   /** Register a subclass so fromJSON() can find it later. */
   static registerSubclass(kind, Ctor) {
      if (!kind || typeof kind !== "string") throw new Error("registerSubclass: kind must be a string");
      if (typeof Ctor !== "function") throw new Error("registerSubclass: ctor must be a constructor");
      // Overwrite is fine in dev reloads; warn if you want:
      // if (this.#registry.has(kind)) console.warn(`[sr3e] Re-registering procedure kind "${kind}"`);
      this.#registry.set(kind, Ctor);
      // Convenience: give the constructor a stable kind
      try {
         Object.defineProperty(Ctor, "kind", { value: kind, configurable: true });
      } catch {}
   }

   /** Lookup a registered constructor by kind. */
   static getCtor(kind) {
      return this.#registry.get(kind) ?? null;
   }

   /** Optional tooling: list all registered kinds (nice for debugging). */
   static listKinds() {
      return Array.from(this.#registry.keys());
   }

   /**
    * Convenience: JSON.stringify wrapper around toJSON().
    */
   serialize() {
      return JSON.stringify(this.toJSON());
   }

   /**
    * Convenience: JSON.parse + fromJSON().
    */
   static async deserialize(json, opts = {}) {
      const obj = typeof json === "string" ? JSON.parse(json) : json;
      return this.fromJSON(obj, opts);
   }

   /**
    * Hydrate a (sub)class instance from JSON.
    * opts.resolveActor?: async ({uuid,id}) => Actor
    * opts.resolveItem?: async ({uuid,id}, actor) => Item
    */
   static async fromJSON(obj, opts = {}) {
      if (!obj || typeof obj !== "object") throw new Error("fromJSON: invalid payload");
      const { schema = 1, kind, actor, item, state = {}, extra = null } = obj;

      if (schema !== AbstractProcedure.#SCHEMA_VERSION) {
         // optional: migrate or just warn
         DEBUG &&
            LOG.warn(`AbstractProcedure.fromJSON: schema mismatch ${schema} != ${AbstractProcedure.#SCHEMA_VERSION}`, [
               __FILE__,
               __LINE__,
            ]);
      }

      // Default resolvers (allow override via opts)
      const resolveActor =
         opts.resolveActor ||
         (async (ref) => {
            if (!ref) return null;
            if (ref.uuid && typeof fromUuid === "function") {
               try {
                  return await fromUuid(ref.uuid);
               } catch {}
            }
            return game.actors?.get(ref.id) ?? null;
         });
      const resolveItem =
         opts.resolveItem ||
         (async (ref, resolvedActor) => {
            if (!ref) return null;
            if (ref.uuid && typeof fromUuid === "function") {
               try {
                  return await fromUuid(ref.uuid);
               } catch {}
            }
            return resolvedActor?.items?.get(ref.id) || game.items?.get(ref.id) || null;
         });

      const callerDoc = await resolveActor(actor);
      const itemDoc = await resolveItem(item, callerDoc);
      if (!callerDoc || !itemDoc) throw new Error("fromJSON: could not resolve caller and/or item");

      // Find the concrete class
      const Ctor = AbstractProcedure.getCtor(kind);
      if (!Ctor) throw new Error(`fromJSON: no registered subclass for kind="${kind}"`);

      const proc = new Ctor(callerDoc, itemDoc);

      // Base state
      if (typeof state.title === "string") proc.#titleStore.set(state.title);
      if (Number.isFinite(Number(state.targetNumber))) proc.#targetNumberStore.set(Number(state.targetNumber));
      const mods = Array.isArray(state.modifiers) ? state.modifiers.map((m) => ({ ...m })) : [];
      proc.#modifiersArrayStore.set(mods);
      if (Number.isFinite(Number(state.dice))) proc.#diceStore.set(Math.max(0, Number(state.dice)));
      if (Number.isFinite(Number(state.poolDice))) proc.#poolDiceStore.set(Math.max(0, Number(state.poolDice)));
      if (Number.isFinite(Number(state.karmaDice))) proc.#karmaDiceStore.set(Math.max(0, Number(state.karmaDice)));
      proc.#isDefaulting = !!state.isDefaulting;
      if (typeof state.linkedAttribute === "string" || state.linkedAttribute === null)
         proc.#linkedAttributeStore.set(state.linkedAttribute ?? null);
      proc.#contestIds = Array.isArray(state.contestIds) ? state.contestIds.filter(Boolean) : [];

      // Subclass extras
      if (typeof proc.fromJSONExtra === "function") {
         await proc.fromJSONExtra(extra ?? null, { opts, payload: obj });
      }

      return proc;
   }

   // ---------- instance ----------
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
   #poolDiceStore;
   #karmaDiceStore;
   #associatedPoolKey = null;
   #modifiersTotalStore;
   #finalTNStore;
   #difficultyStore;
   #disposers = [];
   #hasTargetsStore = readable(false, (set) => {
      const update = (user) => {
         if (user && user.id !== game.user.id) return;
         const count = user?.targets?.size ?? game.user?.targets?.size ?? 0;
         const val = count > 0;
         DEBUG && LOG.info(`[hasTargetsStore] targets:", ${count}, "=>", ${val}`, [__FILE__, __LINE__]);
         set(val);
      };

      // hook and prime initial value
      Hooks.on("targetToken", update);
      update(game.user); // initial

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
         this.#poolDiceStore = writable(0);
         this.#karmaDiceStore = writable(0);
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
         this.#associatedPoolKey = subTypeData?.associatedDicePool ?? null;
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

   // ---------- serialization (instance) ----------
   /**
    * Subclasses can override to add more payload.
    * Return a plain object.
    */
   toJSONExtra() {
      return null;
   }

   /**
    * Subclasses can override to restore extra payload.
    * May be async.
    */
   // async fromJSONExtra(extra, { opts, payload }) {}

   /**
    * Emit a versioned, minimal JSON shape for transport.
    */
   // AbstractProcedure.js (only the toJSON body changes)

   toJSON() {
      return {
         schema: AbstractProcedure.#SCHEMA_VERSION,
         kind: this.constructor.kind || this.constructor.name, // <- important
         actor: { id: this.#caller?.id ?? null, uuid: this.#caller?.uuid ?? null },
         item: { id: this.#item?.id ?? null, uuid: this.#item?.uuid ?? null },
         state: {
            title: get(this.#titleStore),
            targetNumber: Number(get(this.#targetNumberStore) ?? 4),
            modifiers: (get(this.#modifiersArrayStore) ?? []).map((m) => ({ ...m })),
            dice: Number(get(this.#diceStore) ?? 0),
            poolDice: Number(get(this.#poolDiceStore) ?? 0),
            karmaDice: Number(get(this.#karmaDiceStore) ?? 0),
            isDefaulting: !!this.#isDefaulting,
            linkedAttribute: get(this.#linkedAttributeStore),
            contestIds: this.#contestIds.slice(),
         },
         extra: this.toJSONExtra(), // subclass-specific payload
      };
   }

   // ---------- basic getters/setters ----------

   get hasTargetsStore() {
      return this.#hasTargetsStore;
   }

   get hasTargets() {
      return get(this.#hasTargetsStore);
   }

   get targetTokens() {
      return Array.from(game.user.targets || []);
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
      return get(this.#titleStore);
   }
   // explicit alias for convenience in UI code
   get titleStore() {
      return this.#titleStore;
   }

   get modifiersArrayStore() {
      DEBUG && !this.#modifiersArrayStore && LOG.error("Modifiers has not been set", [__FILE__, __LINE__]);
      return this.#modifiersArrayStore;
   }

   get targetNumberStore() {
      return this.#targetNumberStore;
   }

   get modifiersTotalStore() {
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

   get poolDice() {
      return Math.max(0, Number(get(this.#poolDiceStore) ?? 0));
   }
   set poolDice(v) {
      this.#poolDiceStore.set(Math.max(0, Number(v) || 0));
   }
   get poolDiceStore() {
      return this.#poolDiceStore;
   }

   get karmaDice() {
      return Math.max(0, Number(get(this.#karmaDiceStore) ?? 0));
   }
   set karmaDice(v) {
      this.#karmaDiceStore.set(Math.max(0, Number(v) || 0));
   }
   get karmaDiceStore() {
      return this.#karmaDiceStore;
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

   shouldSelfPublish() {
      return true;
   }

   // The default label; subclasses override as they like.
   getKindOfRollLabel() {
      const t = game?.i18n?.localize?.bind(game.i18n);
      return this.hasTargets ? t?.("sr3e.label.challenge") ?? "Challenge" : t?.("sr3e.label.roll") ?? "Roll";
   }

   getItemLabel() {
      // Prefer the item’s name; fall back to the procedure’s title
      return this.item?.name ?? (typeof this.title === "string" ? this.title : "");
   }

   // (keep these from earlier)
   getPrimaryActionLabel() {
      const t = game?.i18n?.localize?.bind(game.i18n);
      return this.hasTargets ? t?.("sr3e.button.challenge") ?? "Challenge!" : t?.("sr3e.button.roll") ?? "Roll!";
   }

   isPrimaryActionEnabled() {
      const tn = Number(this.finalTN({ floor: 2 }));
      return Number.isFinite(tn) && tn > 1;
   }

   // Whether the main action is enabled (TN must be >= 2)
   isPrimaryActionEnabled() {
      const tn = Number(this.finalTN({ floor: 2 }));
      return Number.isFinite(tn) && tn > 1;
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

   // ---------- mods ----------
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

   // ---------- math ----------
   finalTN({ floor = null } = {}) {
      const mods = get(this.#modifiersArrayStore) ?? [];
      const base = Number(get(this.#targetNumberStore) ?? 4);
      const sum = mods.reduce((a, m) => a + (Number(m?.value) || 0), base);
      return floor == null ? sum : Math.max(floor, sum);
   }

   #computeClampedPoolDice(selected) {
      let sel = Math.max(0, Number(selected) || 0);

      const mods = get(this.#modifiersArrayStore) ?? [];
      const forbid = mods.some((m) => m?.forbidPool === true);
      if (forbid) return 0;

      const caps = mods
         .map((m) => Number(m?.poolCap))
         .filter((n) => Number.isFinite(n) && n >= 0);
      if (caps.length) sel = Math.min(sel, Math.min(...caps));

      const available = Math.max(0, Number(get(this.#currentDicePoolStore) ?? 0));
      sel = Math.min(sel, available);

      return Math.max(0, Math.floor(sel));
   }

   buildFormula(explodes = true) {
      const baseDice = Math.max(0, this.dice);
      const poolDice = this.#computeClampedPoolDice(this.poolDice);
      const karmaDice = Math.max(0, this.karmaDice);

      const totalDice = Math.max(0, baseDice + poolDice + karmaDice);
      if (totalDice <= 0) return "0d6";

      const base = `${totalDice}d6`;
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

   async execute(/* opts */) {
      throw new Error("AbstractProcedure.execute must be overridden by subclasses");
   }

   /** Optional hook: run just before the roll is evaluated. Subclasses may override. */
   async onChallengeWillRoll({ baseRoll /*, actor*/ }) {
      baseRoll.options = baseRoll.options || {};

      const selPool = this.#computeClampedPoolDice(this.poolDice);
      if (selPool > 0) {
         if (this.#associatedPoolKey) {
            const key = `${this.#associatedPoolKey}Dice`;
            if (baseRoll.options[key] == null) baseRoll.options[key] = selPool;
         } else {
            if (!Array.isArray(baseRoll.options.pools)) baseRoll.options.pools = [];
            if (!baseRoll.options.pools.some((p) => (p?.name ?? p?.key) === "Pool")) {
               baseRoll.options.pools.push({ name: "Pool", key: "pool", dice: selPool });
            }
         }
      }

      const kd = Math.max(0, this.karmaDice);
      if (kd > 0 && baseRoll.options.karmaDice == null) baseRoll.options.karmaDice = kd;
   }

   /** Optional hook: run after the roll is fully resolved. Subclasses may override. */
   async onChallengeResolved(/* { roll, actor } */) {}

   // ---------- resoponder helpers ----------

   // AbstractProcedure.js (inside the class)

   // Family-agnostic contested outcome renderer; returns HTML + optional resistance prep
   async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
      const initName = initiator?.name ?? "Attacker";
      const tgtName = target?.name ?? "Defender";

      const initHtml = SR3ERoll.renderVanilla(initiator, initiatorRoll);
      const tgtHtml = SR3ERoll.renderVanilla(target, targetRoll);
      const winner = netSuccesses > 0 ? initName : tgtName;

      return {
         html: `
      <p><strong>Contested roll between ${initName} and ${tgtName}</strong></p>
      <h4>${initName}</h4>${initHtml}
      <h4>${tgtName}</h4>${tgtHtml}
      <p><strong>${winner}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
    `,
         resistancePrep: null, // subclasses can return a full prep for damage resistance
      };
   }

   // Default: nothing to prep. Subclasses (e.g., Firearm) can build a resist-prep blob.
   buildResistancePrep(exportCtx, { initiator, target }) {
      return null;
   }

   /**
    * Build the defense procedure instance that should run on the defender side.
    * Default: use exportCtx.next.kind to choose a registered procedure and hydrate it.
    * Subclasses may override for custom behavior.
    */
   async buildDefenseProcedure(exportCtx, { defender, contestId }) {
      if (!exportCtx?.next?.kind) {
         throw new Error("export.next.kind is required to build the defense procedure");
      }
      const kind = exportCtx.next.kind;
      const DefenseCtor = AbstractProcedure.getCtor(kind);
      if (!DefenseCtor) {
         throw new Error(`No registered procedure for kind="${kind}"`);
      }
      const proc = new DefenseCtor(defender, /* item */ null);
      if (typeof proc.fromContestExport === "function") {
         await proc.fromContestExport(exportCtx, { contestId, initiatorExport: exportCtx });
      }
      return proc;
   }

   /**
    * Default responder prompt as HTML string.
    * Subclasses can override `getResponderPromptHTML` to fully customize the block,
    * but MUST include buttons with [data-responder="yes"] and [data-responder="no"].
    */
   buildDefaultResponderPromptHTML(exportCtx /*, { contest } */) {
      const ui = exportCtx?.next?.ui;
      if (!ui?.prompt || !ui?.yes || !ui?.no) {
         throw new Error("export.next.ui.{prompt,yes,no} are required for responder UI");
      }
      return `
      <div class="sr3e-responder-prompt">
        <div class="sr3e-responder-text">${ui.prompt}</div>
        <div class="buttons-horizontal-distribution" role="group" aria-label="Defense choice">
          <button class="sr3e-response-button yes" data-responder="yes">${ui.yes}</button>
          <button class="sr3e-response-button no" data-responder="no">${ui.no}</button>
        </div>
      </div>`;
   }

   /**
    * Optional override for subclasses. If not provided, `buildDefaultResponderPromptHTML` is used.
    * Must return an HTML string that includes [data-responder="yes"] and [data-responder="no"] buttons.
    */
   async getResponderPromptHTML(exportCtx, { contest }) {
      return this.buildDefaultResponderPromptHTML(exportCtx, { contest });
   }

   // ---------- defaulting helpers ----------
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
