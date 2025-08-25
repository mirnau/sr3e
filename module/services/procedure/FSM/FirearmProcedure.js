import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import FirearmService from "@families/FirearmService.js";
import { writable, get } from "svelte/store";
import { localize } from "@services/utilities.js";

function RuntimeConfig() {
   return CONFIG?.sr3e || {};
}

export default class FirearmProcedure extends AbstractProcedure {
   #attackCtx = null;
   #selectedPoolKey = null;

   constructor(caller, item) {
      super(caller, item, { lockPriority: "advanced" });
      this.weaponModeStore = writable(item?.system?.mode ?? "semiauto");
      this.ammoAvailableStore = writable(this.#ammo());
   }

   get tnModifiers() {
      return this.modifiersArrayStore;
   }

   getFlavor() {
      const w = this.item?.name ?? "Firearm";
      return `${w} Attack`;
   }

   getChatDescription() {
      const w = this.item?.name ?? "Firearm";
      return `<div>${w}</div>`;
   }

   resetRecoil() {
      FirearmService.resetAllRecoilForActor(this.caller?.id);
   }

   syncRecoil({ declaredRounds = 1, ammoAvailable = null } = {}) {
      const mod = FirearmService.recoilModifierForComposer({
         actor: this.caller,
         caller: { item: this.item },
         declaredRounds,
         ammoAvailable,
      });
      const id = "recoil";
      this.tnModifiers.update((arr = []) => {
         const base = arr.filter((m) => m.id !== id);
         return mod ? [...base, { ...mod, id, weaponId: this.item?.id, source: "auto" }] : base;
      });
   }

   primeRangeForWeapon(attackerToken, targetToken, rangeShiftLeft = 0) {
      const mod = FirearmService.rangeModifierForComposer({
         actor: this.caller,
         caller: { item: this.item },
         attackerToken,
         targetToken,
         rangeShiftLeft,
      });
      if (!mod) return;
      this.upsertMod({ ...mod, weaponId: this.item?.id, source: "auto" });
   }

   precompute({
      declaredRounds = 1,
      ammoAvailable = null,
      attackerToken = null,
      targetToken = null,
      rangeShiftLeft = 0,
   } = {}) {
      const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {
         declaredRounds,
         ammoAvailable,
         attackerToken,
         targetToken,
         rangeShiftLeft,
      });
      this.#attackCtx = { plan, damage, ammoId };
      if (this.item?.system?.mode) this.weaponModeStore.set(this.item.system.mode);
      if (Number.isFinite(ammoAvailable)) this.ammoAvailableStore.set(Number(ammoAvailable));
      else this.ammoAvailableStore.set(this.#ammo());
   }

   async execute({ OnClose, CommitEffects } = {}) {
      try {
         OnClose?.();
         const actor = this.caller;
         const formula = this.buildFormula(true);
         const baseRoll = SR3ERoll.create(formula, { actor });
         await this.onChallengeWillRoll?.({ baseRoll, actor });
         const roll = await baseRoll.evaluate(this);
         await baseRoll.waitForResolution();
         await CommitEffects?.();
         const ids = this.contestIds;
         if (ids?.length) {
            for (const id of ids) OpposeRollService.expireContest(id);
            this.clearContests();
         }
         Hooks.callAll("actorSystemRecalculated", actor);
         await this.onChallengeResolved?.({ roll, actor });
         return roll;
      } catch (err) {
         DEBUG && ui.notifications.error("Challenge failed");
         throw err;
      }
   }

   getPrimaryActionLabel() {
      if (this.hasTargets) return localize(RuntimeConfig().procedure.challenge);
      const fire = localize(RuntimeConfig().procedure.fire);
      const weapon = this.item?.name ?? "";
      return weapon ? `${fire} ${weapon}` : fire;
   }

   getKindOfRollLabel() {
      return this.hasTargets ? localize(RuntimeConfig().procedure.challenge) : localize(RuntimeConfig().procedure.roll);
   }

   getItemLabel() {
      return this.item?.name ?? "";
   }

   isPrimaryActionEnabled() {
      return get(this.finalTNStore) >= 2;
   }

   setSelectedPoolKey(key) {
      this.#selectedPoolKey = key || null;
   }

   async onChallengeResolved({ roll, actor }) {
      if (!this.#attackCtx) {
         const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {});
         this.#attackCtx = { plan, damage, ammoId };
      }
      const weapon = this.item;
      const plan = this.#attackCtx?.plan;
      if (weapon && plan) await FirearmService.onAttackResolved(actor, weapon, plan);
      this.#attackCtx = null;
   }

   getDefenseHint() {
      return {
         type: "attribute",
         key: "reaction",
         tnMod: 0,
         tnLabel: localize(RuntimeConfig().procedure.weapondifficulty),
      };
   }

   async getResponderPromptHTML(exportCtx) {
      const ui = exportCtx?.next?.ui || {};
      const prompt = String(ui.prompt || "");
      const yes = String(ui.yes || "");
      const no = String(ui.no || "");
      if (!prompt || !yes || !no) throw new Error("export.next.ui.{prompt,yes,no} are required for responder UI");
      return `
      <div class="sr3e-responder-prompt">${prompt}</div>
      <div class="buttons-horizontal-distribution" role="group" aria-label="Defense choice">
        <button class="sr3e-response-button yes" data-responder="yes">${yes}</button>
        <button class="sr3e-response-button no"  data-responder="no">${no}</button>
      </div>
    `;
   }

   buildDefenseProcedure(exportCtx, { defender, contestId }) {
      const kind = String(exportCtx?.next?.kind || "");
      const Ctor = AbstractProcedure.getCtor(kind);
      if (!Ctor) throw new Error(`No registered defense procedure for kind="${kind}"`);
      const baseArgs = exportCtx?.next?.args || {};
      return new Ctor(defender, null, { ...baseArgs, contestId });
   }

   #attackHeader(exportCtx) {
      const plan = exportCtx?.plan || {};
      const mode = plan.modeName || null;
      const rounds = Number(plan.declaredRounds ?? 1);
      const modeBits = [];
      if (mode) modeBits.push(`Mode: <b>${this.#cap(mode)}</b>`);
      if (Number.isFinite(rounds) && rounds > 1) modeBits.push(`Rounds: <b>${rounds}</b>`);
      return modeBits.length ? `<p>${modeBits.join(" • ")}</p>` : "";
   }

   async renderContestOutcome(exportCtx, { initiator, target, initiatorRoll, targetRoll, netSuccesses }) {
      const weaponName = this.item?.name || exportCtx?.weaponName || "Attack";
      const top = `
    <p><strong>Contested roll between ${initiator.name} and ${target.name}</strong></p>
    <p><strong>${initiator.name}</strong> attacks <strong>${target.name}</strong> with <em>${weaponName}</em>.</p>
  `;
      const headerBits = this.#attackHeader(exportCtx);
      const iSummary = this.#summarizeRollGeneric(initiator, initiatorRoll);
      const tSummary = this.#summarizeRollGeneric(target, targetRoll);
      const iHtml = SR3ERoll.renderRollOutcome(initiatorRoll);
      const tHtml = SR3ERoll.renderRollOutcome(targetRoll);
      const winner = netSuccesses > 0 ? initiator : target;
      const html = `
    ${top}
    ${headerBits}

    <h4>${initiator.name}</h4>
    ${iSummary}
    ${iHtml}

    <h4>${target.name}</h4>
    ${tSummary}
    ${tHtml}

    <p><strong>${winner.name}</strong> wins the opposed roll (${Math.abs(netSuccesses)} net successes)</p>
  `;
      const resistancePrep = netSuccesses > 0 ? this.buildResistancePrep(exportCtx, { initiator, target }) : null;
      return { html, resistancePrep };
   }

   buildResistancePrep(exportCtx, { initiator, target }) {
      const plan = exportCtx?.plan ?? this.#attackCtx?.plan ?? {};
      const damage = exportCtx?.damage ?? this.#attackCtx?.damage ?? {};
      const prep = FirearmService.prepareDamageResolution(target, { plan, damage });
      prep.familyKey = "firearm";
      prep.weaponId = exportCtx?.weaponId || this.item?.id || null;
      prep.weaponName = exportCtx?.weaponName || this.item?.name || "Attack";
      const ap = Number(plan?.attackPower ?? damage?.power);
      prep.tnBase = ap;
      const resistMods = FirearmService.resistanceTNModsForTarget?.(target, {
         plan,
         damage,
         weapon: this.item,
      });
      prep.tnMods = Array.isArray(resistMods) ? resistMods : [];
      return prep;
   }

   exportForContest() {
      const weapon = this.item;
      const attacker = this.caller;
      const tnBase = Number(get(this.targetNumberStore) ?? 4);
      const tnMods = (get(this.modifiersArrayStore) ?? []).map((m) => ({
         id: m.id ?? null,
         name: m.name ?? "",
         value: Number(m.value) || 0,
      }));
      if (!this.#attackCtx) {
         const { plan, damage, ammoId } = FirearmService.beginAttack(attacker, weapon, {});
         this.#attackCtx = { plan, damage, ammoId };
      }
      const { tnMod, tnLabel } = this.getDefenseHint();
      return {
         familyKey: "firearm",
         weaponId: weapon?.id ?? null,
         weaponName: weapon?.name ?? "Attack",
         plan: this.#attackCtx?.plan ?? null,
         damage: this.#attackCtx?.damage ?? null,
         tnBase,
         tnMods,
         next: {
            kind: "dodge",
            ui: {
               prompt: `${attacker?.name ?? "Attacker"} attacks with ${weapon?.name ?? "weapon"}. Dodge?`,
               yes: "Dodge",
               no: "Don’t Dodge",
            },
            args: {
               initiatorId: attacker?.id,
               weaponId: weapon?.id,
               weaponName: weapon?.name ?? "Attack",
               defenseTNMod: tnMod,
               defenseTNLabel: tnLabel,
            },
         },
      };
   }

   #cap(s) {
      if (!s) return "";
      const t = String(s)
         .replace(/[_\-]+/g, " ")
         .trim();
      return t.charAt(0).toUpperCase() + t.slice(1);
   }

   #attackContext(exportCtx) {
      const plan = exportCtx?.plan || {};
      const mode = plan.modeName || null;
      const rounds = Number(plan.declaredRounds ?? 1);
      const tnBase = Number(exportCtx?.tnBase);
      const modeBits = [];
      if (mode) modeBits.push(`Mode: <b>${this.#cap(mode)}</b>`);
      if (Number.isFinite(rounds) && rounds > 1) modeBits.push(`Rounds: <b>${rounds}</b>`);
      const mods = Array.isArray(exportCtx?.tnMods) ? exportCtx.tnMods : [];
      const items = mods
         .map((m) => {
            const v = Number(m.value) || 0;
            const sign = v >= 0 ? "+" : "−";
            const abs = Math.abs(v);
            const name = m.name || (m.id ? String(m.id) : "");
            return `<li><span>${name}</span><b>${sign}${abs}</b></li>`;
         })
         .join("");
      return `
    <div class="sr3e-attack-context">
      ${modeBits.length ? `<p>${modeBits.join(" • ")}</p>` : ""}
      <p>Attack TN: <b>${tnBase}</b></p>
      ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
    </div>
  `;
   }

   #tnBreakdownFromRoll(rollJson) {
      const o = rollJson?.options || {};
      const base = Number(o.tnBase ?? 4);
      const mods = Array.isArray(o.tnMods) ? o.tnMods : [];
      const finalTN = Number.isFinite(Number(o.targetNumber))
         ? Number(o.targetNumber)
         : Math.max(2, base + mods.reduce((a, m) => a + (Number(m.value) || 0), 0));
      const sum = mods.reduce((a, m) => a + (Number(m.value) || 0), 0);
      const items = mods
         .map((m) => {
            const v = Number(m.value) || 0;
            const sign = v >= 0 ? "+" : "−";
            const abs = Math.abs(v);
            const name = m.name || (m.id ? String(m.id) : "");
            return `<li><span>${name}</span><b>${sign}${abs}</b></li>`;
         })
         .join("");
      return `
    <div class="sr3e-tn-breakdown">
      <p>TN: <b>${finalTN}</b> <small>(base ${base}${
         sum ? (sum > 0 ? ` + ${sum}` : ` − ${Math.abs(sum)}`) : ""
      })</small></p>
      ${items ? `<ul class="sr3e-tn-mods">${items}</ul>` : ""}
    </div>
  `;
   }

   #contribLineFromRoll(rollJson) {
      const o = rollJson?.options || {};
      const pools = [];
      if (Array.isArray(o.pools)) {
         for (const p of o.pools) {
            const name = typeof p?.name === "string" ? p.name : typeof p?.key === "string" ? this.#cap(p.key) : "Pool";
            const dice = Number(p?.dice ?? p?.value ?? 0);
            if (dice > 0) pools.push(`${name} ${dice}`);
         }
      }
      const legacy = [
         ["combatPoolDice", "Combat Pool"],
         ["controlPoolDice", "Control Pool"],
         ["hackingPoolDice", "Hacking Pool"],
         ["astralPoolDice", "Astral Pool"],
         ["spellPoolDice", "Spell Pool"],
      ];
      for (const [key, label] of legacy) {
         const n = Number(o[key] ?? 0);
         if (n > 0 && !pools.some((s) => s.startsWith(label + " "))) pools.push(`${label} ${n}`);
      }
      const kd = Math.max(0, Number(o.karmaDice || 0));
      const kr = Math.max(0, Number(o.karmaRerolls || 0));
      const karmaBits = [];
      if (kd > 0) karmaBits.push(`${kd} die`);
      if (kr > 0) karmaBits.push(`${kr} reroll${kr === 1 ? "" : "s"}`);
      const tail = [];
      if (pools.length) tail.push(`Pools: ${pools.join(", ")}`);
      if (karmaBits.length) tail.push(`Karma: ${karmaBits.join(", ")}`);
      return tail.length ? `<p class="sr3e-roll-summary"><small>${tail.join(" • ")}</small></p>` : "";
   }

   #summarizeRollGeneric(actor, rollJson) {
      const o = rollJson?.options || {};
      const readName = (v) => {
         if (v == null) return null;
         if (typeof v === "string") return v;
         if (typeof v === "object") return v.name ?? v.label ?? v.key ?? null;
         return null;
      };
      let skillName = readName(o.skillKey ?? o.skill);
      let specName = readName(o.specialization ?? o.spec ?? o.specKey ?? o.specializationName);
      let attrName = readName(o.attributeKey ?? o.attribute);
      let isDefault = !!(o.isDefaulting ?? o.defaulting);

      // Fallback: attacker’s item may carry the skill/specialization/defaulting info
      if (!skillName && !attrName && actor?.id === this.caller?.id) {
         const info = this.#resolveItemSkillAndSpec();
         if (info) {
            skillName = info.skillName ?? skillName;
            specName = info.specName ?? specName;
            isDefault = info.isDefault ?? isDefault;
         }
      }

      const mainBits = [];
      if (skillName) {
         mainBits.push(`Skill: ${this.#cap(skillName)}`);
         if (specName) mainBits.push(`Specialization: ${this.#cap(specName)}`);
         if (isDefault) mainBits.push("Defaulting");
      } else if (attrName) {
         mainBits.push(`Attribute: ${this.#cap(attrName)}`);
      }
      const mainLine = mainBits.length ? `<p class="sr3e-roll-summary"><small>${mainBits.join(", ")}</small></p>` : "";
      const tnBlock = this.#tnBreakdownFromRoll(rollJson);
      const contrib = this.#contribLineFromRoll(rollJson);
      return `${mainLine}\n${tnBlock}\n${contrib}`;
   }

   #resolveItemSkillAndSpec() {
      const sys = this.item?.system ?? {};
      const linked = String(sys.linkedSkillId ?? "").trim();
      if (!linked) return null;
      const [skillId, specIndexRaw] = linked.split("::");
      if (!skillId) return null;
      const skill = this.caller?.items?.get?.(skillId);
      if (!skill) return null;
      const type = skill.system?.skillType;
      const sub = type ? skill.system?.[`${type}Skill`] ?? {} : {};
      const specs = Array.isArray(sub.specializations) ? sub.specializations : [];
      const specIndex = Number.parseInt(specIndexRaw, 10);
      const specObj = Number.isFinite(specIndex) ? specs[specIndex] : null;
      const skillName = skill.name ?? (type ? String(type) : null);
      const specName = specObj?.name ?? (typeof specObj === "string" ? specObj : null);
      const isDefault = !!sys.isDefaulting;
      return { skillName, specName, isDefault };
   }

   #attackerSummaryFromItem() {
      const info = this.#resolveItemSkillAndSpec();
      if (!info) return "";
      const parts = [];
      if (info.skillName) parts.push(`Skill: ${info.skillName}`);
      if (info.specName) parts.push(`Specialization: ${info.specName}`);
      if (info.isDefault) parts.push("Defaulting");
      return parts.length ? `<p class="sr3e-roll-summary"><small>${parts.join(", ")}</small></p>` : "";
   }

   #defenderSummaryFromRoll(_actor, rollJson) {
      const o = rollJson?.options ?? {};
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
      const mainBits = [];
      if (skillName) {
         mainBits.push(`Skill: ${this.#cap(skillName)}`);
         if (specName) mainBits.push(`Specialization: ${this.#cap(specName)}`);
         if (isDefault) mainBits.push("Defaulting");
      } else if (attrName) {
         mainBits.push(`Attribute: ${this.#cap(attrName)}`);
      }
      const poolEntries = [];
      const pushPool = (label, n) => {
         const v = Number(n || 0);
         if (v > 0) poolEntries.push(`${label} ${v}`);
      };
      pushPool("Combat Pool", o.combatPoolDice);
      pushPool("Control Pool", o.controlPoolDice);
      pushPool("Hacking Pool", o.hackingPoolDice);
      pushPool("Astral Pool", o.astralPoolDice);
      pushPool("Spell Pool", o.spellPoolDice);
      if (Array.isArray(o.pools)) {
         for (const p of o.pools) {
            const name = typeof p?.name === "string" ? p.name : typeof p?.key === "string" ? p.key : null;
            const dice = Number(p?.dice ?? p?.value ?? 0);
            if (name && dice > 0) poolEntries.push(`${this.#cap(name)} ${dice}`);
         }
      }
      const karmaBits = [];
      const kd = Number(o.karmaDice || 0);
      if (kd > 0) karmaBits.push(`${kd} die`);
      const kr = Number(o.karmaRerolls || 0);
      if (kr > 0) karmaBits.push(`${kr} reroll${kr === 1 ? "" : "s"}`);
      const out = [];
      if (mainBits.length) out.push(`<p class="sr3e-roll-summary"><small>${mainBits.join(", ")}</small></p>`);
      const tailBits = [];
      if (poolEntries.length) tailBits.push(`Pools: ${poolEntries.join(", ")}`);
      if (karmaBits.length) tailBits.push(`Karma: ${karmaBits.join(", ")}`);
      if (tailBits.length) out.push(`<p class="sr3e-roll-summary"><small>${tailBits.join(" • ")}</small></p>`);
      return out.join("\n");
   }

   #ammo() {
      return Number(this.item?.system?.ammo?.value ?? 0);
   }
}
