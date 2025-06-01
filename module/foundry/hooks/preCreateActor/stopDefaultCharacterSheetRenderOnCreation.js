import { flags } from "../../services/commonConsts.js";

export default async function stopDefaultCharacterSheetRenderOnCreation(_docs, actor, options, _userId) {
    if (actor.type !== "character") return true;
    foundry.utils.setProperty(actor, "flags.sr3e.actor.isCharacterCreation", true);
    options.renderSheet = false;
}
