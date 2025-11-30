// module/services/procedure/FSM/AttributeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import { get } from "svelte/store";

function RuntimeConfig() {
  return CONFIG?.sr3e || {};
}

export default class AttributeProcedure extends AbstractProcedure {
  static KIND = "attribute";

  #attrKey = "strength";

  get hasTargets() {
    return super.hasTargets;
  }

  constructor(caller, _item = null, { attributeKey = "strength", title = null } = {}) {
    super(caller, null, { lockPriority: "simple" });
    this.#attrKey = String(attributeKey || "strength").toLowerCase();

    const label = title || (RuntimeConfig().attributes?.[this.#attrKey] ?? this.#attrKey);
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

    baseRoll.options ??= {};
    baseRoll.options.attributeKey = this.#attrKey;
    baseRoll.options.type = "attribute";

    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();
    await CommitEffects?.();
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  async getResponderPromptHTML(exportCtx /*, { contest } */) {
    const key = String(
      this?.args?.attributeKey || exportCtx?.attributeKey || this.#attrKey || "attribute"
    ).toUpperCase();
    return `
      <div class="sr3e-responder-prompt">
        <div class="sr3e-responder-text">Opposed ${key} test</div>
        <div class="buttons-horizontal-distribution" role="group" aria-label="Response">
          <button class="sr3e-response-button yes" data-responder="yes">Accept</button>
          <button class="sr3e-response-button no"  data-responder="no">Decline</button>
        </div>
      </div>`;
  }

  get isOpposed() {
    const hasTargets = (game.user?.targets?.size ?? 0) > 0;
    const tn = get(this.targetNumberStore);
    return hasTargets && tn != null;
  }

  exportForContest() {
    return {
      familyKey: "attribute",
      attributeKey: this.#attrKey,
      next: { kind: AttributeResponseProcedure.KIND }, // defender rolls AttributeResponseProcedure
    };
  }

  toJSONExtra() { return { attributeKey: this.#attrKey }; }
  async fromJSONExtra(extra) {
    if (extra?.attributeKey) this.#attrKey = String(extra.attributeKey).toLowerCase();
  }
}

// Late import for KIND reference
import AttributeResponseProcedure from "@services/procedure/FSM/AttributeResponseProcedure.js";
