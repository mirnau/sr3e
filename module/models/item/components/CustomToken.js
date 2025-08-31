// module/models/itemcomponents/customtoken.js
const { fields } = foundry.data;

/**
 * CustomToken — minimal schema for oversized/vehicle tokens.
 * Can be embedded as an item component (e.g. in Mechanical actors).
 */
export default class CustomToken extends foundry.abstract.DataModel {
   static defineSchema() {
      return {
         /** Grid footprint (in grid units, not px) */
         width: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
         height: new fields.NumberField({ integer: true, min: 1, initial: 1 }),

         /** Image path for the token art */
         texture: new fields.StringField({ initial: "", blank: true }),
      };
   }
}
