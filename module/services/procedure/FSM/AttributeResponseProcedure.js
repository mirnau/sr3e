// module/services/procedure/FSM/AttributeResponseProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import { localize } from "@services/utilities.js";

function RuntimeConfig() { return CONFIG?.sr3e || {}; }

export default class AttributeResponseProcedure extends AbstractProcedure {
  static KIND = "attribute-response";

  #attrKey = "strength";
  #contestId = null;

  constructor(defender, _item = null, { attributeKey = "strength", title = null } = {}) {
    super(defender, null, { lockPriority: "simple" });
    this.#attrKey = String(attributeKey || "strength").toLowerCase();

    const label = title || (RuntimeConfig().attributes?.[this.#attrKey] ?? this.#attrKey);
    this.title = typeof label === "string" ? label : this.#attrKey;

    const a = defender?.system?.attributes?.[this.#attrKey];
    const rating = Number(a?.total ?? a?.value ?? 0) || 0;
    this.dice = Math.max(0, rating);
  }

  get hasTargets() { return false; }
  get isOpposed() { return false; }
  shouldSelfPublish() { return false; }

  getKindOfRollLabel() { return localize(RuntimeConfig().procedure.respond); }
  getPrimaryActionLabel() { return localize(RuntimeConfig().procedure.respond); }

  getFlavor() { return `${this.title} Response`; }
  getChatDescription() { return `<div>${this.title} response</div>`; }

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

    if (this.#contestId) {
      OpposeRollService.deliverResponse(this.#contestId, roll.toJSON());
    }

    Hooks.callAll("actorSystemRecalculated", actor);
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  async fromContestExport(exportCtx, { contestId } = {}) {
    this.#contestId = contestId ?? null;

    const k = String(exportCtx?.attributeKey || this.#attrKey || "strength").toLowerCase();
    this.#attrKey = k;

    const label = RuntimeConfig().attributes?.[k] ?? k;
    this.title = typeof label === "string" ? label : k;

    const a = this.caller?.system?.attributes?.[k];
    const rating = Number(a?.total ?? a?.value ?? 0) || 0;
    this.dice = Math.max(0, rating);
  }

  toJSONExtra() { return { attributeKey: this.#attrKey, contestId: this.#contestId }; }
  async fromJSONExtra(extra) {
    if (extra?.attributeKey) this.#attrKey = String(extra.attributeKey).toLowerCase();
    this.#contestId = extra?.contestId ?? this.#contestId;
  }
}
