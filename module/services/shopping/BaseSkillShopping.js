import { get } from "svelte/store";

// Base helpers shared by skill shopping strategies
export default class BaseSkillShopping {
  constructor({ actor, skill, actorStoreManager, itemStoreManager }) {
    this.actor = actor;
    this.skill = skill;
    this.actorStoreManager = actorStoreManager;
    this.itemStoreManager = itemStoreManager;

    this.type = (skill?.system?.skillType ?? "active"); // active | knowledge | language
    this.field = `${this.type}Skill`;

    // Item stores
    this.baseRW = itemStoreManager.GetRWStore(`${this.field}.value`);
    this.specsRW = itemStoreManager.GetRWStore(`${this.field}.specializations`);

    // Language-only read/write field
    this.readwriteRW = this.type === "language" ? itemStoreManager.GetRWStore(`languageSkill.readwrite.value`) : null;
  }

  dispose() {}

  // Linked Attribute resolution (live RO sum)
  linkedAttributeKey() {
    const key = this.skill?.system?.[this.field]?.linkedAttribute ?? null;
    return key || null;
  }

  linkedAttributeRO() {
    const key = this.linkedAttributeKey();
    return key ? this.actorStoreManager.GetSumROStore(`attributes.${key}`) : null;
  }

  linkedAttributeSum() {
    const ro = this.linkedAttributeRO();
    if (!ro) return 0;
    try { const v = get(ro); return Number(v?.sum ?? 0) || 0; } catch { return 0; }
  }

  currentBase() {
    try { return Number(get(this.baseRW) ?? 0) || 0; } catch { return 0; }
  }

  // Cost factor per SR3E table
  factorFor(targetRating, linkedAttr) {
    const isActive = this.type === "active";
    const doubleAttr = (linkedAttr || 0) * 2;
    if (targetRating <= (linkedAttr || 0)) {
      return isActive ? 1.5 : 1.0;
    } else if (targetRating <= doubleAttr) {
      return isActive ? 2.0 : 1.5;
    } else {
      return isActive ? 2.5 : 2.0;
    }
  }

  // Per-increment cost: factor(newRating) * newRating
  costForTarget(newRating) {
    const linked = this.linkedAttributeSum();
    const f = this.factorFor(newRating, linked);
    return f * newRating;
  }

  // Specializations constraints
  maxSpecializationsAllowed(baseRating) { return Math.max(0, Number(baseRating || 0)); }
  maxSpecRating(baseRating) {
    const b = Number(baseRating || 0);
    if (b <= 1) return 3; // exception: base 1 allows spec 3
    return 2 * b;
  }
}

