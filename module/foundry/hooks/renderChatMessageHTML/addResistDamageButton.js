import { hooks } from "@services/commonConsts.js";

export function addResistDamageButton(message, html, data) {
   const node = html.querySelector(".sr3e-resist-damage-button");
   if (!node || node.dataset.sr3eResistWired) return;

   node.dataset.sr3eResistWired = "1";

   const context = JSON.parse(decodeURIComponent(node.dataset.context || "%7B%7D"));
   const button = document.createElement("button");
   button.type = "button";
   button.className = "sr3e-resist";
   button.textContent = game.i18n.localize("sr3e.resist") || "Resist";

   button.addEventListener("click", async () => {
      const { contestId, initiatorId, defenderId, weaponId, prep } = context;

      const defender = game.actors.get(defenderId);
      if (!defender) throw new Error("sr3e: defender not found");

      const sheet = defender.sheet;

      const applyCallerData = () => {
         // Recompute the resistance TN from its parts to ensure any runtime
         // modifiers (like dodge successes) are reflected. This mirrors
         // OpposeRollService.#computeTNFromPrep.
         const tn = Math.max(
            2,
            Number(prep?.tnBase ?? 0) +
               (Array.isArray(prep?.tnMods)
                  ? prep.tnMods.reduce((a, m) => a + (Number(m.value) || 0), 0)
                  : Number(prep?.tn ?? 0))
         );

         sheet.setRollComposerData(
            {
               isResistingDamage: true,
               contestId,
               initiatorId,
               defenderId,
               weaponId,
               tn,
               prep,
               tnLabel: game.i18n.localize("sr3e.resistanceTN") || "Damage Resistance",
               panelTitle: game.i18n.localize("sr3e.damageResistance") || "Damage Resistance",
               explodes: true,
            },
            { visible: true }
         );
      };

      if (!sheet.rendered) {
         Hooks.once(hooks.renderCharacterActorSheet, (app) => {
            if (app === sheet) applyCallerData();
         });
         await sheet.render(true);
      } else {
         applyCallerData();
      }
   });

   node.appendChild(button);
}
