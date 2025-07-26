import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class GadgetModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         type: new foundry.data.fields.StringField({
            required: true,
            initial: "weaponmod",
         }),

         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}

/* 
Gadget types 


"Wearable" tech item class maybe to group:
actor -- clothing
actor -- armour
actor -- bioware
actor -- cyberwear / smart links / wired reflexes etc etc
--> wearble gadget

"Control device item"
rigger control board
hacker control board

item -- guns
item -- explosive
--> weapon gadget, scope, mount, maybe smart link?
--> ammunition clip gadget

spell item 
foci item or gadget

*/
