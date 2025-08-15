import { StoreManager } from "module/svelte/svelteHelpers/StoreManager.svelte";
import { writable, get } from "svelte/store";
import { localize } from "@services/utilities.js";

const config = CONFIG.sr3e;

export default class AbstractProcedure {
  #caller;
  #item;
  #isDefaulting = false;

  #subSkill = null;
  #specialization = null;
  #readwrite = null;

  // Stores
  #targetNumberStore;
  #modifiersArrayStore;
  #titleStore;
  #linkedAttributeStore;
  #currentDicePoolStore;
  #diceStore; // <-- ADDED: base dice for the roll (skill/spec/attr)

  constructor(caller = null, item = null) {
    if (this.constructor === AbstractProcedure) {
      DEBUG && LOG.error("Cannot instantiate abstract class AbstractProcedure", [__FILE__, __LINE__]);
      ui.notifications.warn("Cannot instantiate abstract class AbstractProcedure");
    } else {
      this.#targetNumberStore = writable(4);
      this.#modifiersArrayStore = writable([]); // ensure always defined
      this.#titleStore = writable("Roll");
      this.#diceStore = writable(0);           // default 0 dice
      this.#linkedAttributeStore = writable(null);
      this.#currentDicePoolStore = writable(0);
    }

    if (caller && item) {
      this.#caller = caller;
      this.#item = item;

      this.#titleStore.set(item.name);

      const itemStoreManager = StoreManager.Subscribe(this.#item);
      const actorStoreManager = StoreManager.Subscribe(this.#caller);

      const linkedSkillIdStore = GetRWStore("linkedSkillId");
      const [skillId, specIndexRaw] = String(linkedSkillIdStore.get() ?? "").split("::");
      const skill = this.#caller.items.get(skillId);

      const subType = skill?.system?.skillType;
      const subTypeData = subType ? (skill.system?.[`${subType}Skill`] ?? {}) : {};
      const specializationArray = subTypeData?.specializations ?? [];
      this.#linkedAttributeStore.set(subTypeData.linkedAttribute ?? null);

      const specIndex = Number.parseInt(specIndexRaw);
      this.#specialization = Number.isFinite(specIndex) ? specializationArray[specIndex] : null;

      const baseDice = Number(this.#specialization?.value ?? subTypeData?.value ?? 0) || 0;
      this.#diceStore.set(baseDice);

      if (subType === "active") {
        this.#currentDicePoolStore =
          actorStoreManager.GetSumROStore(`dicePools.${subTypeData.associatedDicePool}`);
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
    }
  }

  /* ---------------------- Basic getters/setters ---------------------- */
  get hasTargets() { return (game.user?.targets?.size ?? 0) > 0; }

  get linkedAttribute() { return get(this.#linkedAttributeStore); }

  set title(v) { this.#titleStore?.set?.(v); }
  get title()  { return this.#titleStore; } // store (Composer subscribes with {$title})

  get tnModifiers() {
    DEBUG && !this.#modifiersArrayStore && LOG.error("Modifiers has not been set", [__FILE__, __LINE__]);
    return this.#modifiersArrayStore; // store (array)
  }

  get targetNumber() { return this.#targetNumberStore; } // store (number)

  // Dice: expose both value and store
  get dice() { return Number(get(this.#diceStore) ?? 0) || 0; }
  set dice(v) { this.#diceStore.set(Math.max(0, Number(v) || 0)); }
  get diceStore() { return this.#diceStore; }

  get isDefaulting() { return this.#isDefaulting; }

  isCaller(actor) { return actor?.id === this.#caller?.id; }

  /* --------------------------- Mod helpers --------------------------- */
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

  finalTN({ floor = null } = {}) {
    const mods = get(this.#modifiersArrayStore) ?? [];
    const base = Number(get(this.#targetNumberStore) ?? 4);
    const sum = mods.reduce((a, m) => a + (Number(m?.value) || 0), base);
    return floor == null ? sum : Math.max(floor, sum);
  }

  /* -------------------- Roll formula (NEW: base) --------------------- */
  /**
   * Build SR3E dice formula string for SR3ERoll.
   * - explodes=false  → "Xd6"
   * - open test       → "Xd6x"
   * - TN present      → "Xd6xTN" (TN floored at 2)
   */
  buildFormula(explodes = true) {
    const dice = this.dice;
    if (dice <= 0) return "1d6";

    const base = `${dice}d6`;
    if (!explodes) return base;

    // Treat explicit open-test as "no TN". Also allow targetNumber being null/undefined.
    const tnBase = get(this.#targetNumberStore);
    const isOpen = this.#isOpenTest() || tnBase == null;
    if (isOpen) return `${base}x`;

    const tn = this.finalTN();
    return `${base}x${Math.max(2, Number(tn) || 2)}`;
  }

  onDestroy() {}

  /* --------------------------- Defaulting ---------------------------- */
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
