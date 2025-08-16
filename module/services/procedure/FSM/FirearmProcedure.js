import { get } from "svelte/store";
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import FirearmService from "@families/FirearmService.js";

export default class FirearmProcedure extends AbstractProcedure {
   #attackCtx = null; // { plan, damage, ammoId }

   constructor(caller, item) {
      super(caller, item);
   }

   // ----- small alias (since you used tnModifiers.update(...) above)
   get tnModifiers() {
      return this.modifiersArrayStore;
   }

   /** Optional: nicer chat bits for SR3ERoll.renderVanillaFromProcedure */
   getFlavor() {
      const w = this.item?.name ?? "Firearm";
      return `${w} Attack`;
   }
   getChatDescription() {
      const w = this.item?.name ?? "Firearm";
      return `<div>${w}</div>`;
   }

   /** Reset recoil tracking for this actor */
   resetRecoil() {
      FirearmService.resetAllRecoilForActor(this.caller?.id);
   }

   /** Ensure recoil mod row is kept in sync for the composer */
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

   /** Add/refresh range mod row in the composer */
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

   /**
    * Precompute the attack plan + damage for this firearm before rolling.
    * Composer can call this when declaredRounds/ammo changes.
    */
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
   }

   // FirearmProcedure.js
   getPrimaryActionLabel() {
      const t = game?.i18n?.localize?.bind(game.i18n);
      if (this.hasTargets) return t?.("sr3e.button.challenge") ?? "Challenge!";
      const fire = t?.("sr3e.button.fire") ?? "Fire";
      const weapon = this.item?.name ?? "";
      return weapon ? `${fire} ${weapon}` : fire;
   }

   /** After the contested roll completes, finalize firearm attack resolution */
   async onChallengeResolved({ roll, actor }) {
      // If precompute hasn't run, compute on-demand with conservative defaults
      if (!this.#attackCtx) {
         const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item, {});
         this.#attackCtx = { plan, damage, ammoId };
      }

      const weapon = this.item;
      const plan = this.#attackCtx?.plan;

      if (weapon && plan) {
         await FirearmService.onAttackResolved(actor, weapon, plan);
      }

      // Clear transient state after resolution
      this.#attackCtx = null;
   }

   // ---------- defense guidance & export for opposed flow ----------

   /**
    * What the defender rolls against (used for UI labels and default TN mod).
    * Keep it strict; no fallbacks.
    */
   getDefenseHint() {
      // Adjust this to your firearm rules (range/mode might add difficulty etc.)
      return {
         type: "attribute",
         key: "reaction",
         tnMod: 0,
         tnLabel: "Weapon difficulty", // localize if you wish
      };
   }

   /**
    * Single source of truth shipped to OpposeRollService.startProcedure().
    * Includes the full attack snapshot + the "next" step spec (Dodge).
    */
   exportForContest() {
      const weapon = this.item;
      const attacker = this.caller;

      // Base TN shown on the attacker's roll; defender will have its own mods
      const tnBase = Number(get(this.targetNumberStore) ?? 4);

      // Snapshot attack TN modifiers (useful for later displays/resistance)
      const tnMods = (get(this.modifiersArrayStore) ?? []).map((m) => ({
         id: m.id ?? null,
         name: m.name ?? "",
         value: Number(m.value) || 0,
      }));

      // Ensure we have a current attack plan/damage
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

         // Tell the responder exactly what procedure to run next and how to label it
         next: {
            kind: "dodge", // must be registered via AbstractProcedure.registerSubclass("dodge", DodgeProcedure)
            ui: {
               prompt: `${attacker?.name ?? "Attacker"} attacks with ${weapon?.name ?? "weapon"}. Dodge?`,
               yes: "Dodge",
               no: "Don’t Dodge",
            },
            // Minimal args for DodgeProcedure; keep this tight & explicit
            args: {
               initiatorId: attacker?.id,
               weaponId: weapon?.id,
               weaponName: weapon?.name ?? "Attack",
               defenseTNMod: tnMod,
               defenseTNLabel: tnLabel,
               // If your dodge needs more (e.g., scene/token ids), add them here explicitly
            },
         },
      };
   }
}
