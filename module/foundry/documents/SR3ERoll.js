import OpposeRollService from "@services/OpposeRollService.js";

/**
 * Procedure-driven roll:
 * - `evaluate(procedure)` takes an AbstractProcedure (or subclass) instance.
 * - Never reads `this.options` for context; the procedure drives everything.
 * - For opposed rolls, we start contests via OpposeRollService using the procedure.
 */
export default class SR3ERoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
    this.actor = data?.actor || null;
    this._procedure = null;
    this._contested = false;
    this._waitingOn = null; // contest ids (string or string[])
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

  /**
   * Evaluate the roll using the provided procedure.
   * Contract (minimal) expected from `procedure`:
   *   - procedure.caller  : Actor
   *   - procedure.getTargets() : Actor[] (may be empty)
   *   - procedure.getFlavor() : string
   *   - procedure.finalTN({ floor?: number }) : number
   *   - (optional) procedure.onAfterEvaluate(roll)
   *   - (optional, opposed only) procedure.exportForContest() → { familyKey, weaponId?, weaponName?, plan?, damage?, tnBase?, tnMods? }
   */
  async evaluate(procedure) {
    DEBUG && !(procedure instanceof AbstractProcedure) && LOG.error("SR3ERoll.evaluate requires a procedure", [__FILE__, __LINE__]);
    this._procedure = procedure;
    this.actor = procedure.caller || this.actor;

    // Roll the dice; NO options/fallbacks.
    await super.evaluate({});

    // Allow the procedure to react (ammo, recoil bookkeeping, etc.)
    if (typeof procedure.onAfterEvaluate === "function") {
      await procedure.onAfterEvaluate(this);
    }

    // Opposed?
    const targets = (typeof procedure.getTargets === "function" ? procedure.getTargets() : []) || [];
    if (targets.length > 0) {
      this._contested = true;
      this._waitingOn = [];

      // Make sure the roll JSON has a TN so success counting works in chat
      const rollJSON = this.toJSON();
      const tn = Number(procedure.finalTN?.({ floor: 2 }) ?? null);
      if (!rollJSON.options) rollJSON.options = {};
      rollJSON.options.targetNumber = Number.isFinite(tn) ? tn : undefined;

      for (const target of targets) {
        const contestId = await OpposeRollService.startProcedure({
          procedure,
          target,
          initiatorRoll: rollJSON, // snapshot of THIS roll
        });
        if (contestId) this._waitingOn.push(contestId);
      }

      return this;
    }

    // Non-opposed → immediate chat
    await this.toMessageFromProcedure();
    return this;
  }

  /**
   * Create a vanilla chat message driven by the procedure.
   */
  async toMessageFromProcedure() {
    const content = SR3ERoll.renderVanillaFromProcedure(this._procedure, this.toJSON());
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
      const contestId = this._waitingOn;
      await new Promise((resolve) => {
        const t = setInterval(() => {
          if (!OpposeRollService.getContestById(contestId)) {
            clearInterval(t);
            resolve();
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
            clearInterval(t);
            resolve();
          }
        }, 250);
      });
    }
  }

  // ---------------------------
  // Rendering helpers
  // ---------------------------

  /**
   * Procedure-driven vanilla renderer (TN from procedure, description from procedure).
   * This intentionally does NOT use rollData.options for context.
   */
  static renderVanillaFromProcedure(procedure, rollData) {
    const term = rollData.terms?.[0];
    const raw = term?.results ?? [];
    const results = raw.filter((r) => r.active !== false)
    const dice = results.length;

    // TN from procedure (if present)
    const tn = Number(procedure?.finalTN?.({ floor: 2 }) ?? null);
    const hasTN = Number.isFinite(tn);
    const successes = hasTN ? results.filter((r) => !r.discarded && r.result >= tn).length : null;

    const ones = results.filter((r) => r.result === 1).length;
    const critical = ones >= Math.ceil(dice / 2);

    const explodeMod = term?.modifiers?.find?.((m) => /^x\d*$/.test(m)) ?? "";
    const shownFormula = `${term?.number ?? "?"}d6${explodeMod}`;
    const formula = rollData.formula ?? shownFormula;

    // Ask the procedure to describe the roll
    const descriptionHtml = String(procedure?.getChatDescription?.() ?? "");

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

    return `
  <div class="dice-roll expanded sr3e-vanilla ${critical ? "is-critical" : ""}">
    <div class="dice-result">
      <div class="dice-context"><em>${descriptionHtml}${hasTN ? ` vs TN ${tn}` : ""} using ${formula}</em></div>
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
                ${results
                  .map((d) => {
                    const cls = ["roll", "_sr3edie", "d6"];
                    if (d.result === 6) cls.push("max");
                    if (d.exploded) cls.push("explode", "exploded");
                    if (hasTN && d.result >= tn) cls.push("success");
                    return `<li class="${cls.join(" ")}">${d.result}</li>`;
                  })
                  .join("")}
              </ol>
            </div>
          </section>
        </div>
      </div>
      ${status}
    </div>
  </div>`;
  }

  // Legacy helpers kept for other callers; not used by the new path.
  static renderVanilla(actor, rollData) {
    return SR3ERoll.#buildVanillaRoll(actor, rollData);
  }

  static #buildVanillaRoll(actor, rollData) {
    // (unchanged; legacy path for non-procedure callers)
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

    return `
  <div class="dice-roll expanded sr3e-vanilla ${critical ? "is-critical" : ""}">
    <div class="dice-result">
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
                ${results
                  .map((d) => {
                    const cls = ["roll", "_sr3edie", "d6"];
                    if (d.result === 6) cls.push("max");
                    if (d.exploded) cls.push("explode", "exploded");
                    if (hasTN && d.result >= tn) cls.push("success");
                    return `<li class="${cls.join(" ")}">${d.result}</li>`;
                  })
                  .join("")}
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>`;
  }

  static Register() {
    CONFIG.Dice.rolls = [SR3ERoll];
    window.Roll = SR3ERoll;
    DEBUG && LOG.success("Registered:", SR3ERoll.name);
  }
}
