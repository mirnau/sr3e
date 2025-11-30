import { CharacterCreationApp } from "../../applications/CharacterCreationApp.js"; // Adjust path as needed

export default async function displayCreationDialog(actor, options, userId) {
   if (actor.type !== "character") return true;
   if (!game.users.get(userId)?.isSelf) return true;

   const dialogResult = await _runCharacterCreationDialog(actor);

   if (!dialogResult) {
      DEBUG && LOG.info(`Character creation canceled for actor: ${actor.name}. Deleting actor.`, [__FILE__, __LINE__]);
      await actor.delete();
      return false;
   }

   actor.sheet.render(true);
   return true;
}

async function _runCharacterCreationDialog(actor) {
   return new Promise((resolve) => {
      try {
         // Create the ApplicationV2-based dialog
         const app = new CharacterCreationApp(actor, {
            onSubmit: (result) => {
               resolve(result);
            },
            onCancel: () => {
               resolve(false);
            },
         });

         // Render the application - this handles all DOM management automatically
         app.render(true);
      } catch (e) {
         DEBUG && LOG.error("Failed to create character creation dialog", [__FILE__, __LINE__], e);
         resolve(false);
      }
   });
}
