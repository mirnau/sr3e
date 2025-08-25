// services/procedure/FSM/SkillResponseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import { localize } from "@services/utilities.js";

function C() { return CONFIG?.sr3e || {}; }

export default class SkillResponseProcedure extends AbstractProcedure {
  static KIND = "skill-response";

  #skillId = null;
  #skillName = "Skill";
  #specName = null;
  #poolKey = null;
  #contestId = null;

  constructor(defender, _noItem = null, _args = {}) {
    super(defender, null, { lockPriority: "simple" });
    this.title = `${this.#skillName} Response`;
  }

  get hasTargets() { return false; }
  get isOpposed() { return false; }
  shouldSelfPublish() { return false; }

  getKindOfRollLabel() { return localize(C().procedure.respond); }
  getPrimaryActionLabel() { return localize(C().procedure.respond); }

  getFlavor() { return `${this.title}`; }
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
    await roll.waitForResolution();
    await CommitEffects?.();

    if (this.#contestId) {
      OpposeRollService.deliverResponse(this.#contestId, roll.toJSON());
    }

    Hooks.callAll("actorSystemRecalculated", actor);
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  async fromContestExport(exportCtx, { contestId } = {}) {
    this.#contestId = contestId ?? null;

    const idFromExport = exportCtx?.skillId ?? null;
    const skill = idFromExport ? this.caller?.items?.get?.(idFromExport) : null;

    this.#skillId   = skill?.id ?? idFromExport ?? null;
    this.#skillName = exportCtx?.skillName ?? skill?.name ?? this.#skillName;
    this.#specName  = exportCtx?.specName ?? null;
    this.#poolKey   = exportCtx?.poolKey ?? null;

    let rating = 0;
    if (skill) {
      const type  = skill.system?.skillType;
      const sub   = type ? (skill.system?.[`${type}Skill`] ?? {}) : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const spec  = this.#specName ? specs.find((s) => (s?.name ?? s?.label) === this.#specName) : null;
      rating = Number(spec?.value ?? sub.value ?? 0) || 0;

      if (this.#specName && !Number.isFinite(Number(spec?.value)) && Number.isFinite(sub.value)) {
        this.upsertMod({ id: "spec-cap", name: "Spec cap", poolCap: Math.floor(Number(sub.value) / 2) });
      }
    }
    this.dice  = Math.max(0, rating);
    this.title = `${this.#skillName} Response`;
  }

  toJSONExtra() {
    return {
      contestId: this.#contestId,
      skillId:   this.#skillId,
      specName:  this.#specName,
      poolKey:   this.#poolKey,
      skillName: this.#skillName
    };
  }
  async fromJSONExtra(extra) {
    this.#contestId = extra?.contestId ?? this.#contestId;
    this.#skillId   = extra?.skillId   ?? this.#skillId;
    this.#specName  = extra?.specName  ?? this.#specName;
    this.#poolKey   = extra?.poolKey   ?? this.#poolKey;
    this.#skillName = extra?.skillName ?? this.#skillName;
  }
}
