import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";

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
      const sub = type ? (skill.system?.[`${type}Skill`] ?? {}) : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const spec = Number.isFinite(Number(specIndex)) ? specs[Number(specIndex)] : null;

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
  }

  async getResponderPromptHTML(exportCtx) {
    const label = String(exportCtx?.skillName || this.#skillName || "Skill").toUpperCase();
    return `
      <div class="sr3e-responder-prompt">
        <div class="sr3e-responder-text">Opposed ${label} test</div>
        <div class="buttons-horizontal-distribution" role="group" aria-label="Response">
          <button class="sr3e-response-button yes" data-responder="yes">Accept</button>
          <button class="sr3e-response-button no"  data-responder="decline">Decline</button>
        </div>
      </div>`;
  }

  exportForContest() {
    return {
      familyKey: "skill",
      skillId: this.#skillId,
      skillName: this.#skillName,
      specName: this.#specName,
      poolKey: this.#poolKey,
      next: { kind: SkillProcedure.KIND }
    };
  }

  async fromContestExport(exportCtx, { contestId } = {}) {
    const id = exportCtx?.skillId ?? this.#skillId ?? null;
    const skill = this.caller?.items?.get?.(id) || null;
    this.#skillId = skill?.id ?? id ?? null;

    if (skill) {
      const type = skill.system?.skillType;
      const sub = type ? (skill.system?.[`${type}Skill`] ?? {}) : {};
      this.#skillName = exportCtx?.skillName ?? skill.name ?? type ?? "Skill";
      this.#specName  = exportCtx?.specName ?? null;
      this.#poolKey   = exportCtx?.poolKey ?? sub.associatedDicePool ?? null;

      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const spec = this.#specName ? specs.find(s => (s?.name ?? s?.label) === this.#specName) : null;
      const rating = Number(spec?.value ?? sub.value ?? 0) || 0;
      this.dice = Math.max(0, rating);

      if (this.#specName && !Number.isFinite(Number(spec?.value)) && Number.isFinite(sub.value)) {
        this.upsertMod({ id: "spec-cap", name: "Spec cap", poolCap: Math.floor(Number(sub.value) / 2) });
      }
    } else {
      this.#skillName = exportCtx?.skillName ?? this.#skillName;
      this.#specName  = exportCtx?.specName ?? this.#specName;
      this.#poolKey   = exportCtx?.poolKey ?? this.#poolKey;
    }

    this.title = this.#skillName;

    if (contestId) this.setContestIds([contestId]);
  }

  #cap(s) {
    if (!s) return "";
    const t = String(s)
      .replace(/[_\-]+/g, " ")
      .trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  #summarizeRollGeneric(rollJson) {
    const o = rollJson?.options || {};
    const readName = (v) => {
      if (v == null) return null;
      if (typeof v === "string") return v;
      if (typeof v === "object") return v.name ?? v.label ?? v.key ?? null;
      return null;
    };
    const skillName = readName(o.skillKey ?? o.skill);
    const specName = readName(o.specialization ?? o.spec ?? o.specKey ?? o.specializationName);
    const attrName = readName(o.attributeKey ?? o.attribute);
    const isDefault = !!(o.isDefaulting ?? o.defaulting);
    const bits = [];
    if (skillName) {
      bits.push(`Skill: ${this.#cap(skillName)}`);
      if (specName) bits.push(`Specialization: ${this.#cap(specName)}`);
      if (isDefault) bits.push("Defaulting");
    } else if (attrName) {
      bits.push(`Attribute: ${this.#cap(attrName)}`);
    }
    return bits.length
      ? `<p class="sr3e-roll-summary"><small>${bits.join(", ")}</small></p>`
      : "";
  }

  async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
    const initName = initiator?.name ?? "Attacker";
    const tgtName = target?.name ?? "Defender";
    const iHtml = SR3ERoll.renderRollOutcome(initiatorRoll);
    const tHtml = SR3ERoll.renderRollOutcome(targetRoll);
    const iSummary = this.#summarizeRollGeneric(initiatorRoll);
    const tSummary = this.#summarizeRollGeneric(targetRoll);
    const winner = netSuccesses > 0 ? initName : tgtName;
    return {
      html: `
      <p><strong>Contested roll between ${initName} and ${tgtName}</strong></p>
      <h4>${initName}</h4>${iSummary}${iHtml}
      <h4>${tgtName}</h4>${tSummary}${tHtml}
      <p><strong>${winner}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
    `,
      resistancePrep: null,
    };
  }

  toJSONExtra() { return { skillId: this.#skillId, specName: this.#specName, poolKey: this.#poolKey, skillName: this.#skillName }; }
  async fromJSONExtra(extra) {
    this.#skillId   = extra?.skillId   ?? this.#skillId;
    this.#specName  = extra?.specName  ?? this.#specName;
    this.#poolKey   = extra?.poolKey   ?? this.#poolKey;
    this.#skillName = extra?.skillName ?? this.#skillName;
  }
}
