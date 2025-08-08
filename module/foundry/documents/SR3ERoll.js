import OpposeRollService from "@services/OpposeRollService.js";

export default class SR3ERoll extends Roll {
   constructor(formula, data = {}, options = {}) {
      super(formula, data, options);
      this.actor = data?.actor || null;
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

   async evaluate(options = {}) {
      this.options = foundry.utils.mergeObject(this.options ?? {}, options ?? {});
      await super.evaluate(this.options);

      const actor = this.actor || ChatMessage.getSpeakerActor(this.options.speaker);

      if (this.options.opposed && actor) {
         const targets = Array.from(game.user.targets)
            .map((t) => t.actor)
            .filter(Boolean);

         const uniqueTargets = [...new Map(targets.map((a) => [a.id, a])).values()];

         if (uniqueTargets.length > 0) {
            this._contested = true;
            this._waitingOn = [];

            for (const target of uniqueTargets) {
               console.log(`[SR3ERoll] Initiator ${actor.name} starting contest vs ${target.name}`);
               const contestId = await OpposeRollService.start({
                  initiator: actor,
                  target,
                  rollData: this.toJSON(),
                  options: this.options,
               });
               this.options.contestId = contestId;
               if (contestId) this._waitingOn.push(contestId);
            }

            return this;
         }
      }

      if (!this.options.suppressMessage) {
         await this.toMessage();
      }

      return this;
   }

   async toMessage() {
      if (!this.options.opposed) {
         const content = SR3ERoll.#buildVanillaRoll(this.actor, this.toJSON());
         const flavor = this.getFlavor();
         return ChatMessage.create({
            content,
            speaker: ChatMessage.getSpeaker(),
            flavor,
         });
      }

      const flavor = this.getFlavor();
      return ChatMessage.create({
         content: await this.render(),
         speaker: ChatMessage.getSpeaker(),
         flavor,
      });
   }

   async waitForResolution() {
      if (!this._contested || !this._waitingOn) return;

      if (typeof this._waitingOn === "string") {
         const contestId = this._waitingOn;

         await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
               if (!OpposeRollService.getContestById(contestId)) {
                  clearInterval(checkInterval);
                  resolve();
               }
            }, 250);
         });
         return;
      }

      if (Array.isArray(this._waitingOn)) {
         await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
               const unresolved = this._waitingOn.filter((id) => OpposeRollService.getContestById(id));
               if (unresolved.length === 0) {
                  clearInterval(checkInterval);
                  resolve();
               }
            }, 250);
         });
         return;
      }
   }

   getFlavor() {
      const type = this.options?.type;
      const parts = [];
      switch (type) {
         case "skill":
         case "specialization":
            if (this.options.skillName) parts.push(this.options.skillName);
            if (this.options.specializationName) parts.push(`(${this.options.specializationName})`);
            break;
         case "attribute":
            parts.push(SR3ERoll.#attrLabel(this.options.attributeKey ?? this.options.attributeName));
            break;
         case "item":
            if (this.options.itemName) parts.push(this.options.itemName);
            break;
         case "resistance": {
            const a = SR3ERoll.#attrLabel(this.options.attributeKey ?? this.options.attributeName, false);
            const staged = this.options.stagedLevel ? `${this.options.stagedLevel} ` : "";
            const dtype = this.options.damageType ?? "Damage";
            parts.push(`Damage Resistance: ${staged}${dtype}${a ? ` (${a})` : ""}`);
            break;
         }
         default:
            if (this.options.skillName) parts.push(this.options.skillName);
            else if (this.options.itemName) parts.push(this.options.itemName);
            else if (this.options.attributeName) parts.push(`Attribute:${this.options.attributeName}`);
            else parts.push("SR3E Roll");
            break;
      }
      return parts.join(" ");
   }

   static Register() {
      CONFIG.Dice.rolls = [SR3ERoll];
      window.Roll = SR3ERoll;
   }

   static #attrLabel(key, strict = true) {
      const dict = CONFIG?.sr3e?.attributes ?? {};
      const ok = key && Object.prototype.hasOwnProperty.call(dict, key);
      if (strict && !ok) throw new Error(`Unknown attribute key: ${key}`);
      return ok ? game.i18n.localize(`sr3e.attributes.${key}`) : key ?? "";
   }

   static #buildVanillaRoll(actor, rollData) {
      const term = rollData.terms?.[0];
      const raw = term?.results ?? [];
      const results = raw.filter((r) => r.active !== false);
      const dice = results.length;

      const tn = Number(rollData?.options?.targetNumber);
      const hasTN = Number.isFinite(tn);
      const successes = hasTN ? results.filter((r) => !r.discarded && r.result >= tn).length : null;

      const ones = results.filter((r) => r.result === 1).length;
      const critical = ones >= Math.ceil(dice / 2);

      const type = rollData.options?.type;
      const skill = rollData.options?.skillName;
      const specialization = rollData.options?.specializationName;
      const attributeKey = rollData.options?.attributeKey ?? rollData.options?.attributeName;
      const itemName = rollData.options?.itemName;

      const explodeMod = term?.modifiers?.find?.((m) => /^x\d*$/.test(m)) ?? "";
      const shownFormula = `${term?.number ?? "?"}d6${explodeMod}`;
      const formula = rollData.formula ?? shownFormula;

      let descriptionHtml;

      const isDefaulting = !!rollData.options?.isDefaulting;
      let defaultingNote = "";

      if (isDefaulting) {
         if (specialization && skill) {
            defaultingNote = " (Defaulting: Specialization → Skill, +4 TN)";
         } else if (skill && attributeKey) {
            defaultingNote = ` (Defaulting: ${skill} → ${SR3ERoll.#attrLabel(attributeKey)}, +4 TN)`;
         } else if (rollData.options?.fromSkill && rollData.options?.toSkill) {
            defaultingNote = ` (Defaulting: ${rollData.options.fromSkill} → ${rollData.options.toSkill}, +4 TN)`;
         } else {
            const skillLabel = skill ?? rollData.options?.fromSkill ?? "Unknown skill";
            const attrLabel = SR3ERoll.#attrLabel(
               rollData.options?.attributeKey ?? rollData.options?.attributeName,
               false
            );
            defaultingNote = ` (Defaulting: ${skillLabel} → ${attrLabel}, +4 TN)`;
         }
      }

      switch (type) {
         case "item": {
            const rows = [];
            if (itemName) rows.push(`<div>Weapon: ${itemName}</div>`);
            if (skill) rows.push(`<div>Skill: ${skill}</div>`);
            if (specialization) rows.push(`<div>Specialization: ${specialization}</div>`);
            if (isDefaulting) rows.push(`<div><strong>${defaultingNote}</strong></div>`);
            descriptionHtml = rows.join("") || `<div>Unspecified roll</div>`;
            break;
         }
         case "skill":
         case "specialization":
            descriptionHtml = `<div>${
               skill ? (specialization ? `${skill} (${specialization})` : skill) : "Unspecified roll"
            }</div>`;
            break;
         case "attribute":
            descriptionHtml = `<div>${SR3ERoll.#attrLabel(attributeKey)}</div>`;
            break;
         case "resistance": {
            const a = SR3ERoll.#attrLabel(attributeKey, false);
            const staged = rollData.options?.stagedLevel ? `${rollData.options.stagedLevel} ` : "";
            const dtype = rollData.options?.damageType ?? "Damage";
            descriptionHtml = `<div>Damage Resistance: ${staged}${dtype}${a ? ` (${a})` : ""}</div>`;
            break;
         }
         default:
            descriptionHtml = `<div>${
               skill || itemName || (attributeKey ? `Attribute:${attributeKey}` : "Unspecified roll")
            }</div>`;
            break;
      }

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
}
