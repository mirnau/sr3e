// UncontestedSkillProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";
import SR3ERoll from "@documents/SR3ERoll.js";

const config = Config.sr3e;

export default class UncontestedSkillProcedure extends AbstractProcedure {
  static KIND = "uncontested-skill";
  static register() { AbstractProcedure.registerSubclass(this.KIND, this); }

  #skillId = null;
  #skillName = "Skill";
  #specName = null;
  #poolKey = null;

  constructor(caller, _item, { skillId, specIndex = null, title = null } = {}) {
    super(caller, /* item */ null);
    const skill = caller?.items?.get?.(skillId) || null;
    this.#skillId = skill?.id ?? null;

    // read skill rating + metadata directly off the skill item
    let rating = 0;
    if (skill) {
      const type = skill.system?.skillType;
      const sub = type ? (skill.system?.[`${type}Skill`] ?? {}) : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const spec = Number.isFinite(Number(specIndex)) ? specs[Number(specIndex)] : null;

      this.#skillName = skill.name || type || "Skill";
      this.#specName  = (spec && (spec.name ?? spec.label ?? String(spec))) || null;
      this.#poolKey   = sub.associatedDicePool || null;

      rating = Number(spec?.value ?? sub.value ?? 0) || 0;

      // help the abstract clamping: cap by half-base when defaulting to a spec
      if (this.#specName && !Number.isFinite(Number(spec?.value)) && Number.isFinite(sub.value)) {
        this.upsertMod({ id: "spec-cap", name: "Spec cap", poolCap: Math.floor(Number(sub.value) / 2) });
      }
    }

    this.title = title || this.#skillName;
    this.dice  = Math.max(0, rating);

    // If you want to allow pools here, add a soft cap based on the pool sum (optional).
    // By default we leave pools enabled; AbstractProcedure will clamp to 0 if no pool store is bound.
  }

  getFlavor() { return `${this.title} Test`; }
  getChatDescription() { return `<div>${this.title}${this.#specName ? ` (${this.#specName})` : ""}</div>`; }

  async execute({ OnClose, CommitEffects } = {}) {
    const ok = ProcedureLock.assertEnter({
      ownerKey: `${UncontestedSkillProcedure.KIND}:${this.caller?.id}`,
      priority: "simple",
      onDenied: () => ui.notifications.warn(game.i18n.localize?.(config.warn.procedureBusy) ?? "Another procedure is in progress.")
    });
    if (!ok) return null;

    try {
      OnClose?.();

      const actor = this.caller;
      const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });
      await this.onChallengeWillRoll?.({ baseRoll, actor });

      baseRoll.options = baseRoll.options || {};
      baseRoll.options.type = "skill";
      baseRoll.options.skill = { id: this.#skillId, name: this.#skillName };
      if (this.#specName) baseRoll.options.specialization = this.#specName;
      if (this.#poolKey) baseRoll.options.pools = [{ key: this.#poolKey, name: this.#poolKey, dice: this.poolDice }];

      const roll = await baseRoll.evaluate(this);
      await baseRoll.waitForResolution();
      await CommitEffects?.();
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
    } finally {
      ProcedureLock.release(`${UncontestedSkillProcedure.KIND}:${this.caller?.id}`);
    }
  }

  toJSONExtra() { return { skillId: this.#skillId, specName: this.#specName, poolKey: this.#poolKey }; }
  async fromJSONExtra(extra) {
    this.#skillId  = extra?.skillId  ?? this.#skillId;
    this.#specName = extra?.specName ?? this.#specName;
    this.#poolKey  = extra?.poolKey  ?? this.#poolKey;
  }
}
