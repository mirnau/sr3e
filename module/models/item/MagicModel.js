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
        // INFO: displays only if magicCategory is "magician"

        // INFO: full or aspected (select)
        magicianType: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        // INFO: (free text)
        tradition: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        // INFO: free text, localized and validated in UI only
        drainResistanceAttribute: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        // INFO: select, displays only if aspected is selected
        aspect: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        // INFO: bool, displays only if magicianType is "full"
        canAstrallyProject: new foundry.data.fields.BooleanField({
          required: false,
          initial: false
        }),

        // INFO: shows only if shaman is selected as tradition
        totem: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),

        // INFO: hidden from player, calculated on character creation?
        spellPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      }),

      adeptData: new foundry.data.fields.SchemaField({
        // INFO: displays only if magicCategory is "adept"

        powerPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      })
    };
  }
}
