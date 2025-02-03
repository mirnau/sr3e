import { unmount } from "svelte";
import Log from "../../../../Log";
import CharacterActorSheet from "../../sheets/CharacterActorSheet";


export function closeMainMasonryGrid(app) {

  if (app.svelteApp) {

    app.actor.mainLayoutResizeObserver.disconnect();
    app.actor.mainLayoutResizeObserver = null;

    Log.success("Masonry observer disconnected.", CharacterActorSheet.name);

    unmount(app.svelteApp);

    console.info("Svelte App Destroyed.", CharacterActorSheet.name);
  }
}
