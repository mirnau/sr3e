// UncontestedAttributeProcedure.js
import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import SR3ERoll from "@documents/SR3ERoll.js";

export default class UncontestedAttributeProcedure extends AbstractProcedure {
  static KIND = "uncontested-attribute";
  static register() { AbstractProcedure.registerSubclass(this.KIND, this); }

  #attrKey = "strength";

  constructor(caller, _item, { attributeKey = "strength", title = null } = {}) {
    super(caller, /*item*/ null, { lockPriority: "simple" });
    this.#attrKey = String(attributeKey || "strength").toLowerCase();

    // set title + base dice from attribute
    const label = title || (CONFIG?.sr3e?.attributes?.[this.#attrKey] ?? this.#attrKey);
    this.title = typeof label === "string" ? label : this.#attrKey;

    const a = caller?.system?.attributes?.[this.#attrKey];
    const rating = Number(a?.total ?? a?.value ?? 0) || 0;
    this.dice = Math.max(0, rating);

    // TN defaults to 4 (already defaulted in abstract)
    // For generic attribute tests we usually disallow pools unless caller passes one via a mod.
    this.upsertMod({ id: "simple-attr", name: "Attribute Test", value: 0, forbidPool: true });
  }

  shouldSelfPublish() { return true; }
  getFlavor() { return `${this.title} Test`; }
  getChatDescription() { return `<div>${this.title} test</div>`; }

  async execute({ OnClose, CommitEffects } = {}) {
    OnClose?.();

    const actor = this.caller;
    const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });
    await this.onChallengeWillRoll?.({ baseRoll, actor });

    // annotate what we’re rolling
    baseRoll.options = baseRoll.options || {};
    baseRoll.options.attributeKey = this.#attrKey;
    baseRoll.options.type = "attribute";

    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();
    await CommitEffects?.();
    await this.onChallengeResolved?.({ roll, actor });
    return roll;
  }

  toJSONExtra() { return { attributeKey: this.#attrKey }; }
  async fromJSONExtra(extra) {
    if (extra?.attributeKey) this.#attrKey = String(extra.attributeKey);
  }
}
