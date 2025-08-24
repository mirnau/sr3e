import OpposeRollService from "@services/OpposeRollService.js";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";

export default class SR3ERoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
    this.actor = data?.actor || null;
    this._procedure = null;
    this._contested = false;
    this._waitingOn = null;
  }

  static create(formula, data = {}, options = {}) {
    return new this(formula, data, options);
  }

  static buildFormula(dice, { explodes = true, targetNumber } = {}) {
    if (dice <= 0) return "1d6";
    const base = `${dice}d6`;
    if (!explodes) return base;
    if (targetNumber == null) return `${base}x`;
    const tn = Number(targetNumber);
    return `${base}x${Math.max(2, tn)}`;
  }

  async evaluate(procedure) {
    if (!(procedure instanceof AbstractProcedure)) throw new Error("SR3ERoll.evaluate requires a procedure");
    this._procedure = procedure;
    this.actor = procedure.caller || this.actor;

    await super.evaluate({});

    if (typeof procedure.onAfterEvaluate === "function") {
      await procedure.onAfterEvaluate(this);
    }

    // Defender short-circuit: return roll to initiator, do not self-publish.
    const ids = Array.isArray(procedure?.contestIds) ? procedure.contestIds.filter(Boolean) : [];
    if (ids.length) {
      const json = this.toJSON();
      for (const id of ids) OpposeRollService.deliverResponse(id, json);
      return this;
    }

    // Initiator: opposed?
    if (procedure.hasTargets) {
      const tokens = procedure.targetTokens;
      const unique = [];
      const seen = new Set();
      for (const token of tokens) {
        const a = token?.actor;
        if (!a || seen.has(a.id)) continue;
        seen.add(a.id);
        unique.push({ actor: a, token });
      }
      if (unique.length) {
        this._contested = true;
        this._waitingOn = [];
        for (const { actor: targetActor, token: targetToken } of unique) {
          const contestId = await OpposeRollService.startProcedure({
            procedure,
            targetActor,
            targetToken,
            roll: this,
          });
          if (contestId) {
            this._waitingOn.push(contestId);
            procedure.appendContestId?.(contestId);
          }
        }
        return this;
      }
    }

    // Non-contested → publish now
    if (procedure.shouldSelfPublish?.() !== false) {
      await this.toMessageFromProcedure();
    }
    return this;
  }

  async toMessageFromProcedure() {
    const descriptionHtml = String(this._procedure?.getChatDescription?.() ?? "");
    const content = SR3ERoll.renderNonContested(this.toJSON(), { descriptionHtml });
    const flavor = String(this._procedure?.getFlavor?.() ?? "");
    return ChatMessage.create({
      content,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor,
    });
  }

  async waitForResolution() {
    if (!this._contested || !this._waitingOn) return;

    if (typeof this._waitingOn === "string") {
      const id = this._waitingOn;
      await new Promise((resolve) => {
        const t = setInterval(() => {
          if (!OpposeRollService.getContestById(id)) {
            clearInterval(t); resolve();
          }
        }, 250);
      });
      return;
    }

    if (Array.isArray(this._waitingOn)) {
      await new Promise((resolve) => {
        const t = setInterval(() => {
          const unresolved = this._waitingOn.filter((id) => OpposeRollService.getContestById(id));
          if (unresolved.length === 0) {
            clearInterval(t); resolve();
          }
        }, 250);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Unified renderer for any *single-party* roll (non-contested UI snippet).
  // Uses TN from rollData.options.targetNumber if present.
  // Optional descriptionHtml is displayed above the formula.
  // ---------------------------------------------------------------------------
  static renderRollOutcome(rollData, { descriptionHtml = "" } = {}) {
    const term = rollData.terms?.[0];
    const raw = term?.results ?? [];
    const results = raw.filter((r) => r.active !== false);
    const dice = results.length;

    const tn = Number(rollData?.options?.targetNumber);
    const hasTN = Number.isFinite(tn);
    const successes = hasTN ? results.filter((r) => !r.discarded && r.result >= tn).length : null;

    const ones = results.filter((r) => r.result === 1).length;
    const critical = ones >= Math.ceil(dice / 2);

    const explodeMod = term?.modifiers?.find?.((m) => /^x\d*$/.test(m)) ?? "";
    const shownFormula = `${term?.number ?? "?"}d6${explodeMod}`;
    const formula = rollData.formula ?? shownFormula;

    const headerRight = hasTN
      ? `${successes} ${successes === 1 ? "success" : "successes"} (TN: ${tn})`
      : `Dice: ${dice}`;

    const status = critical
      ? `<div class="sr3e-chat__critical">Critical failure</div>`
      : hasTN && successes === 0
      ? `<div class="sr3e-chat__failure">Failure</div>`
      : hasTN
      ? `<div class="sr3e-chat__successes">${successes} ${successes === 1 ? "success" : "successes"}</div>`
      : "";

    const ctx = descriptionHtml ? `<div class="dice-context"><em>${descriptionHtml}${hasTN ? ` vs TN ${tn}` : ""} using ${formula}</em></div>` : "";

    return `
      <div class="dice-roll expanded sr3e-vanilla ${critical ? "is-critical" : ""}">
        <div class="dice-result">
          ${ctx}
          <div class="dice-formula">${formula}</div>
          <div class="dice-tooltip">
            <div class="wrapper">
              <section class="tooltip-part">
                <div class="dice">
                  <header class="part-header flexrow">
                    <span class="part-formula">${shownFormula}</span>
                    <span class="part-total">${headerRight}</span>
                  </header>
                  <ol class="dice-rolls">
                    ${results.map((d) => {
                      const cls = ["roll", "_sr3edie", "d6"];
                      if (d.result === 6) cls.push("max");
                      if (d.exploded) cls.push("explode", "exploded");
                      if (hasTN && d.result >= tn) cls.push("success");
                      return `<li class="${cls.join(" ")}">${d.result}</li>`;
                    }).join("")}
                  </ol>
                </div>
              </section>
            </div>
          </div>
          ${status}
        </div>
      </div>`;
  }

  static Register() {
    CONFIG.Dice.rolls = [SR3ERoll];
    window.Roll = SR3ERoll;
    DEBUG && LOG.success("Registered:", SR3ERoll.name);
  }
}
