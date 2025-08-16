// services/procedure/FSM/DodgeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import OpposeRollService from "@services/OpposeRollService.js";

export default class DodgeProcedure extends AbstractProcedure {
   static kind = "dodge";

   #contestId = null;

   constructor(defender, _noItem = null, { contestId } = {}) {
      super(defender, null);

      this.title = game?.i18n?.localize?.("sr3e.dodge.title") ?? "Dodge";
      this.#contestId = contestId ?? null;

      // Base TN 4
      this.targetNumberStore?.set?.(4);

      // No targeting from the defender side; this is a standalone roll.
      // (You can hard-disable if you want.)
   }

   // Flavor in the composer
   getKindOfRollLabel() {
      return game?.i18n?.localize?.("sr3e.label.dodge") ?? "Dodge";
   }
   getItemLabel() {
      return typeof this.title === "string" ? this.title : "";
   }
   getPrimaryActionLabel() {
      return game?.i18n?.localize?.("sr3e.button.dodge") ?? "Dodge!";
   }

   // Never start a new opposed flow from here
   get hasTargets() {
      return false;
   }

   shouldSelfPublish() {
      return false;
   }

   getChatDescription() {
      return "Dodge the incoming attack.";
   }

   // After the defender rolls, hand the result back to the service;
   // addOpposedResponseButton is waiting on waitForResponse(contestId)
   async onChallengeResolved({ roll /*, actor*/ }) {
      try {
         if (!this.#contestId) {
            console.warn("[sr3e] DodgeProcedure missing contestId; cannot deliver response");
            return;
         }
         OpposeRollService.deliverResponse(this.#contestId, roll.toJSON());
      } catch (e) {
         console.error("[sr3e] DodgeProcedure.onChallengeResolved failed:", e);
         ui.notifications?.error?.("Dodge failed to report result.");
      }
   }
}
