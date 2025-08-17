import ResistanceProcedure from "@services/procedure/FSM/ResistanceProcedure.js";

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
      const { defenderId, prep } = context;

      const defender = game.actors.get(defenderId);
      if (!defender) throw new Error("sr3e: defender not found");

      const sheet = defender.sheet;
      if (!sheet.rendered) await sheet.render(true);

      const procedure = new ResistanceProcedure(defender, null, { prep });

      if (typeof sheet.displayRollComposer === "function") {
         sheet.displayRollComposer({ procedure }, { visible: true });
      } else {
         throw new Error("sr3e: sheet.displayRollComposer not available");
      }
   });

   node.appendChild(button);
}
