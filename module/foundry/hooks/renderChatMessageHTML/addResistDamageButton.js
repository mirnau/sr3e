export function addResistDamageButton(message, html) {
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

      const tn = Number(prep?.tn || 0) || 2;

      defender.sheet.setRollComposerData(
         {
            isResistingDamage: true,
            contestId,
            initiatorId,
            defenderId,
            weaponId,
            tn,
            prep,
            tnLabel: game.i18n.localize("sr3e.resistanceTN") || "Damage Resistance",
            explodes: true,
         },
         { visible: true }
      );
   });

   node.appendChild(button);
}
