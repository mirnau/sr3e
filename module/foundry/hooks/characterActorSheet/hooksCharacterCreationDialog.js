import Log from "../../../../Log";
import CharacterCreationDialog from "../../dialogs/CharacterCreationDialog";
import ItemDataService from "../../services/ItemDataService";

export async function renderCharacterCreationDialog(actor, options, userId) {

  if (actor.type !== "character") return;

  Log.info("Character Dialog Initiated", "Create Actor Hook");

  const dialogResult = await _showCharacterCreationDialog(actor);

  if (!dialogResult) {
    console.log(`Character creation canceled for actor: ${actor.name}. Deleting actor.`);
    await actor.delete();
    return false;
  }

  actor.sheet.render(true);

  Log.success("Character Dialog Completed", "Create Actor Hook");
}

async function _showCharacterCreationDialog(actor) {
  
  return new Promise((resolve) => {
    new CharacterCreationDialog(actor, resolve).render(true);
  });
}