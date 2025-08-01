import SkillSpecialization from "@models/item/components/SkillSpecialization.js";
export default class SkillModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         skillType: new foundry.data.fields.StringField({
            required: true,
            initial: "active",
         }),

         activeSkill: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
            linkedAttribute: new foundry.data.fields.StringField({
               required: true,
               initial: "",
            }),
            associatedDicePool: new foundry.data.fields.StringField({
               required: true,
               initial: "",
            }),
            specializations: new foundry.data.fields.ArrayField(
               new foundry.data.fields.SchemaField({
                  ...SkillSpecialization.defineSchema(),
               }),
               {
                  initial: [],
               }
            ),
         }),

         knowledgeSkill: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
            linkedAttribute: new foundry.data.fields.StringField({
               required: true,
               initial: "intelligence",
            }),
           
            specializations: new foundry.data.fields.ArrayField(
               new foundry.data.fields.SchemaField({
                  ...SkillSpecialization.defineSchema(),
               }),
               {
                  initial: [],
               }
            ),
         }),

         languageSkill: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
            linkedAttribute: new foundry.data.fields.StringField({
               required: true,
               initial: "intelligence",
            }),

            //lingos
            specializations: new foundry.data.fields.ArrayField(
               new foundry.data.fields.SchemaField({
                  ...SkillSpecialization.defineSchema(),
               }),
               {
                  initial: [],
               }
            ),
            readwrite: new foundry.data.fields.SchemaField({
               value: new foundry.data.fields.NumberField({
                  required: true,
                  initial: 0,
                  integer: true,
               }),
            }),
            journalId: new foundry.data.fields.StringField({
               required: true,
               initial: "",
            }),
         }),
      };
   }
}
