export default class Creation extends TypeDataModel<CreationSchema, BaseActor> {
    static defineSchema() {
      return {
        attributePoints: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        activePoints: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        knowledgePoints: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        languagePoints: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }
  
  type CreationSchema = {
    attributePoints: NumberField;
    activePoints: NumberField;
    knowledgePoints: NumberField;
    languagePoints: NumberField;
  };