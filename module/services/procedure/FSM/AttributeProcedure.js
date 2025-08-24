// AttributeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";

export default class AttributeProcedure extends AbstractProcedure {
  static KIND = "attribute";
  static register() { AbstractProcedure.registerSubclass(this.KIND, this); }

  #attrKey = "strength";

  constructor(caller, _item = null, { attributeKey = "strength", title = null } = {}) {
    super(caller, null, { lockPriority: "simple" });
    this.#attrKey = String(attributeKey || "strength").toLowerCase();

    const label = title || (CONFIG?.sr3e?.attributes?.[this.#attrKey] ?? this.#attrKey);
    this.title = typeof label === "string" ? label : this.#attrKey;

    const a = caller?.system?.attributes?.[this.#attrKey];
    const rating = Number(a?.total ?? a?.value ?? 0) || 0;
    this.dice = Math.max(0, rating);
  }

  shouldSelfPublish() { return true; }
  getFlavor() { return `${this.title} Test`; }
  getChatDescription() { return `<div>${this.title} test</div>`; }

  async execute({ OnClose, CommitEffects } = {}) {
    OnClose?.();
    const actor = this.caller;

    const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });
    await this.onChallengeWillRoll?.({ baseRoll, actor });

    baseRoll.options = baseRoll.options || {};
    baseRoll.options.attributeKey = this.#attrKey;
    baseRoll.options.type = "attribute";

    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();
    await CommitEffects?.();
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  // Accept / Decline prompt
  async getResponderPromptHTML(exportCtx /*, { contest } */) {
    const key = String(this?.args?.attributeKey || exportCtx?.attributeKey || this.#attrKey || "attribute").toUpperCase();
    return `
      <div class="sr3e-responder-prompt">
        <div class="sr3e-responder-text">Opposed ${key} test</div>
        <div class="buttons-horizontal-distribution" role="group" aria-label="Response">
          <button class="sr3e-response-button yes" data-responder="yes">Accept</button>
          <button class="sr3e-response-button no"  data-responder="decline">Decline</button>
        </div>
      </div>`;
  }

  exportForContest() {
    return {
      familyKey: "attribute",
      attributeKey: this.#attrKey,
      next: { kind: AttributeProcedure.KIND }, // defender also uses AttributeProcedure
    };
  }

  async fromContestExport(exportCtx /*, { contestId, initiatorExport, responderKey } */) {
    const k = String(exportCtx?.attributeKey || this.#attrKey || "strength").toLowerCase();
    this.#attrKey = k;

    const label = CONFIG?.sr3e?.attributes?.[k] ?? k;
    this.title = typeof label === "string" ? label : k;

    const a = this.caller?.system?.attributes?.[k];
    const rating = Number(a?.total ?? a?.value ?? 0) || 0;
    this.dice = Math.max(0, rating);
  }

  toJSONExtra() { return { attributeKey: this.#attrKey }; }
  async fromJSONExtra(extra) { if (extra?.attributeKey) this.#attrKey = String(extra.attributeKey).toLowerCase(); }
}
