import { sr3e } from "@config/config.js";
import SR3EActor from "@documents/SR3EActor.js";
import SR3ECombat from "@documents/SR3ECombat.js";
import SR3Edie from "@documents/SR3Edie.js";
import SR3EItem from "@documents/SR3EItem.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import { flags } from "@services/commonConsts.js";
import { localize } from "@services/utilities.js";

export function configureProject() {
   SR3EActor.Register();
   SR3ECombat.Register();
   SR3Edie.Register();
   SR3ERoll.Register();
   SR3EItem.Register();

   CONFIG.sr3e = sr3e;
   CONFIG.Actor.dataModels = {};
   CONFIG.Item.dataModels = {};
   CONFIG.canvasTextStyle.fontFamily = "VT323";
   CONFIG.defaultFontFamily = "VT323";
   CONFIG.fontDefinitions["Neanderthaw"] = {
      editor: true,
      fonts: [
         {
            urls: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
            weight: 400,
            style: "normal",
         },
      ],
   };

   CONFIG.fontDefinitions["VT323"] = {
      editor: true,
      fonts: [
         {
            urls: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
            weight: 400,
            style: "normal",
         },
      ],
   };

   CONFIG.Actor.typeLabels = {
      broadcaster: localize(CONFIG.sr3e.broadcaster.broadcaster),
      character: localize(CONFIG.sr3e.sheet.playercharacter),
      storytellerscreen: localize(CONFIG.sr3e.storytellerscreen.storytellerscreen),
   };
   CONFIG.Item.typeLabels = {
      ammunition: localize(CONFIG.sr3e.ammunition.ammunition),
      magic: localize(CONFIG.sr3e.magic.magic),
      metatype: localize(CONFIG.sr3e.traits.metatype),
      skill: localize(CONFIG.sr3e.skill.skill),
      transaction: localize(CONFIG.sr3e.transaction.transaction),
      weapon: localize(CONFIG.sr3e.weapon.weapon),
      wearable: localize(CONFIG.sr3e.wearable.wearable),
      gadget: localize(CONFIG.sr3e.gadget.gadget),
      techinterface: localize(CONFIG.sr3e.techinterface.techinterface),
   };

   foundry.applications.apps.DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
   foundry.applications.apps.DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
}
