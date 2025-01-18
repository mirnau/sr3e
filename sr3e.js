import CharacterModel from "./module/models/actor/CharacterModel.js";
import SvelteActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";

async function registerTemplatesFromPathsAsync() {
  const rootFolder = "systems/sr3e/templates";
  const paths = [];

  async function gatherFiles(folder) {
      const { files, dirs } = await FilePicker.browse("data", folder);
      paths.push(...files.filter(file => file.endsWith(".hbs")));
      await Promise.all(dirs.map(gatherFiles));
  }

  await gatherFiles(rootFolder);
  return loadTemplates(paths);
}

Hooks.once("init", function () {

  Actors.unregisterSheet("core", ActorSheet);

  CONFIG.Actor.dataModels = {
      "character": CharacterModel,
  };

  Actors.registerSheet("sr3e", SvelteActorSheet, { types: ["character"], makeDefault: true });

  registerTemplatesFromPathsAsync();
});