export default class MagicModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {

      // INFO: select [none, adept, magician] (selection and localization handled by svelte, this only stores result)
      awakened: new foundry.data.fields.SchemaField({
        archetype: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        priority: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        })
      }),

      magicianData: new foundry.data.fields.SchemaField({

        magicianType: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        tradition: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        drainResistanceAttribute: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        aspect: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        canAstrallyProject: new foundry.data.fields.BooleanField({
          required: false,
          initial: false
        }),

        totem: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        //NOTE: Not exposed in the magic sheet
        spellPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      }),
      
      adeptData: new foundry.data.fields.SchemaField({
        
        //NOTE: Not exposed in the magic sheet
        powerPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      })
    };
  }
}
