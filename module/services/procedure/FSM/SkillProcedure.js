// services/procedure/FSM/SkillProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";

function C() { return CONFIG?.sr3e || {}; }

export default class SkillProcedure extends AbstractProcedure {
  static KIND = "skill";

  #skillId = null;
  #skillName = "Skill";
  #specName = null;
  #poolKey = null;

  constructor(caller, _item, { skillId, specIndex = null, title = null } = {}) {
    super(caller, null, { lockPriority: "simple" });

    const skill = caller?.items?.get?.(skillId) || null;
    this.#skillId = skill?.id ?? null;

    let rating = 0;
    if (skill) {
      const type = skill.system?.skillType;
      const sub  = type ? (skill.system?.[`${type}Skill`] ?? {}) : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const spec  = Number.isFinite(Number(specIndex)) ? specs[Number(specIndex)] : null;

      this.#skillName = skill.name || type || "Skill";
      this.#specName  = (spec && (spec.name ?? spec.label ?? String(spec))) || null;
      this.#poolKey   = sub.associatedDicePool || null;

      rating = Number(spec?.value ?? sub.value ?? 0) || 0;

      if (this.#specName && !Number.isFinite(Number(spec?.value)) && Number.isFinite(sub.value)) {
        this.upsertMod({ id: "spec-cap", name: "Spec cap", poolCap: Math.floor(Number(sub.value) / 2) });
      }
    }

    this.title = title || this.#skillName;
    this.dice  = Math.max(0, rating);
  }

  shouldSelfPublish() { return true; }
  getFlavor() { return `${this.title} Test`; }
  getChatDescription() { return `<div>${this.title}${this.#specName ? ` (${this.#specName})` : ""}</div>`; }

  async execute({ OnClose, CommitEffects } = {}) {
    OnClose?.();
    const actor = this.caller;

    const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });
    await this.onChallengeWillRoll?.({ baseRoll, actor });

    baseRoll.options ??= {};
    baseRoll.options.type  = "skill";
    baseRoll.options.skill = { id: this.#skillId, name: this.#skillName };
    if (this.#specName) baseRoll.options.specialization = this.#specName;
    if (this.#poolKey)  baseRoll.options.pools = [{ key: this.#poolKey, name: this.#poolKey, dice: this.poolDice }];

    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();
    await CommitEffects?.();
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  exportForContest() {
    const actor = this.caller;
    const skillName = this.#skillName;
    const specBit   = this.#specName ? ` (${this.#specName})` : "";
    return {
      familyKey: "skill",
      skillId: this.#skillId,
      skillName: this.#skillName,
      specName: this.#specName,
      poolKey: this.#poolKey,
      next: {
        // IMPORTANT: point to the defender class
        kind: "skill-response",
        ui: {
          // Keep it simple; literals here are fine (Firearm does the same)
          prompt: `${actor?.name || "Attacker"} challenges your ${skillName}${specBit}. Respond?`,
          yes: "Respond",
          no:  "Decline"
        },
        args: {
          // nothing special needed now, but this is where you’d thread hints
        }
      }
    };
  }

  toJSONExtra() {
    return {
      skillId:   this.#skillId,
      specName:  this.#specName,
      poolKey:   this.#poolKey,
      skillName: this.#skillName
    };
  }
  async fromJSONExtra(extra) {
    this.#skillId   = extra?.skillId   ?? this.#skillId;
    this.#specName  = extra?.specName  ?? this.#specName;
    this.#poolKey   = extra?.poolKey   ?? this.#poolKey;
    this.#skillName = extra?.skillName ?? this.#skillName;
  }
}
