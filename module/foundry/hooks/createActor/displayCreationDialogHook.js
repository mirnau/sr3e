import { CharacterCreationApp } from "../../applications/CharacterCreationApp.js"; // Adjust path as needed
import Log from "../../../../Log.js";

export default async function displayCreationDialog(actor, options, userId) {
    if (actor.type !== "character") return true;

    Log.info("Running Character Dialog", displayCreationDialog.name);

    const dialogResult = await _runCharacterCreationDialog(actor);

    if (!dialogResult) {
        console.log(`Character creation canceled for actor: ${actor.name}. Deleting actor.`);
        await actor.delete();
        return false;
    }

    actor.sheet.render(true);
    Log.success("Character Dialog Completed", displayCreationDialog.name);
    return true;
}

async function _runCharacterCreationDialog(actor) {
    return new Promise((resolve) => {
        try {
            // Create the ApplicationV2-based dialog
            const app = new CharacterCreationApp(
                actor, {
                onSubmit: (result) => {
                    resolve(result);
                },
                onCancel: () => {
                    console.log("The character creation was canelled")
                    resolve(false);
                }
            });

            // Render the application - this handles all DOM management automatically
            app.render(true);

        } catch (e) {
            console.error("Failed to create character creation dialog:", e);
            resolve(false);
        }
    });
}