import { flags } from "../../../services/commonConsts.js";

export default async function stopDefaultCharacterSheetRenderOnCreation(_docs, actor, options, _userId) {
    if (actor.type !== "character") return true;
    options.renderSheet = false;
}
