import { flags } from "../../services/commonConsts.js";

export function initActorFlags(actor, options, userId) {
  if (actor.type === "character") {
    actor.setFlag(flags.sr3e, flags.actor.isDossierDetailsOpen, false);
  }
}