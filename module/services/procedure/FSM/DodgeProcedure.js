import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
import OpposeRollService from "@services/OpposeRollService.js";

export default class DodgeProcedure extends AbstractProcedure {
   #contestId = null;
   #attackLabel = ""; // e.g., weapon name or source text

   /**
    * Dodge is attribute/pool based, so we pass only the defender (caller)
    * and NO item. The abstract base will initialize stores with sane defaults.
    */
   constructor(defenderActor) {
      super(defenderActor, /* item */ null);

      // Title & flavor
      this.title = game.i18n?.localize?.("sr3e.dodge.title") || "Dodge";

      // Base TN for Dodge is 4 (mods come from the base class: wound penalty, etc.)
      this.targetNumberStore.set?.(4);

      // We want the roll to use *only* pool dice (no base skill dice).
      // Snapshot current Combat Pool at open; the UI can later constrain/spend as you prefer.
      try {
         const mgr = StoreManager.Subscribe(defenderActor);
         const cpStore = mgr.GetSumROStore("dicePools.combat");
         const cp = Number(get(cpStore)?.sum ?? 0);
         this.dice = Math.max(0, cp); // use available combat pool as base dice for the roll
         StoreManager.Unsubscribe(defenderActor);
      } catch {
         this.dice = 0; // fallback: user still gets "1d6x" minimum from buildFormula's <=0 guard
      }
   }

   /** This procedure should never start a new contest chain. */
   get hasTargets() {
      return false;
   }

   /**
    * Called by the initiator’s procedure when creating the defender’s procedure.
    * Pass in at least: { contestId, attackLabel? }
    */
   applyDefenseContext({ contestId, attackLabel = "" } = {}) {
      this.#contestId = contestId || null;
      this.#attackLabel = String(attackLabel || "");
   }

   /** Optional: extra JSON (not required for local-only dodge, but handy if you ever ship it around). */
   toJSONExtra() {
      return {
         contestId: this.#contestId,
         attackLabel: this.#attackLabel,
      };
   }

   /** Optional: restore extra JSON. */
   async fromJSONExtra(extra) {
      if (!extra) return;
      this.#contestId = extra.contestId ?? this.#contestId;
      this.#attackLabel = extra.attackLabel ?? this.#attackLabel;
   }

   /** Shown in the vanilla renderer (SR3ERoll.renderVanillaFromProcedure). */
   getChatDescription() {
      const src = this.#attackLabel ? ` vs <em>${this.#attackLabel}</em>` : "";
      return `<div>Dodge Test${src}</div>`;
   }

   getKindOfRollLabel() {
      return game?.i18n?.localize?.("sr3e.label.dodge") ?? "Dodge";
   }

   getItemLabel() {
      // For dodge there may be no item; just show the procedure title.
      return typeof this.title === "string" ? this.title : "";
   }

   getPrimaryActionLabel() {
      return game?.i18n?.localize?.("sr3e.button.dodge") ?? "Dodge!";
   }

   /** Flavor line for the chat message. */
   getFlavor() {
      return game.i18n?.localize?.("sr3e.dodge.flavor") || "Dodge";
   }

   /**
    * When the roll (via Challenge.svelte → AbstractProcedure.challenge) resolves,
    * hand the roll back to the opposed flow and let OpposeRollService continue.
    */
   async onChallengeResolved({ roll /*, actor */ }) {
      if (this.#contestId) {
         try {
            OpposeRollService.deliverResponse(this.#contestId, roll.toJSON());
         } catch (e) {
            console.error("[sr3e] DodgeProcedure deliverResponse failed:", e);
         }
      }
   }
}
