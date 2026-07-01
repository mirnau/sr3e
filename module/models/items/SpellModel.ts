import { SPELL_MANIPULATION_SUBTYPE_KEYS } from "../../../lang/config/MagicConfig";
import {
  defineElementalAttackSchema,
  defineThresholdSchema,
  type SpellElementalAttackFields,
  type SpellThresholdFields,
} from "./item-components/SpellRuleFields";

const SPELL_MANIPULATION_SUBTYPE_CHOICES = ["", ...SPELL_MANIPULATION_SUBTYPE_KEYS];

export default class SpellModel extends foundry.abstract.TypeDataModel<SpellSchema, BaseItem> {
  static defineSchema(): SpellSchema {
    return {
      type: new StringField({
        required: true,
        initial: "",
      }),
      category: new StringField({
        required: true,
        initial: "",
      }),
      manipulationSubtype: new StringField({
        required: true,
        initial: "",
        blank: true,
        choices: SPELL_MANIPULATION_SUBTYPE_CHOICES,
      }),
      range: new StringField({
        required: true,
        initial: "los",
      }),
      duration: new SchemaField({
        type: new StringField({
          required: true,
          initial: "",
        }),
        rounds: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      learnedForce: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      targeting: new SchemaField({
        kind: new StringField({
          required: true,
          initial: "attribute",
        }),
        attribute: new StringField({
          required: true,
          initial: "",
        }),
        staticTargetNumber: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      resistance: new SchemaField({
        attribute: new StringField({
          required: true,
          initial: "",
        }),
      }),
      threshold: defineThresholdSchema(),
      elementalAttack: defineElementalAttackSchema(),
      drain: new SchemaField({
        powerModifier: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        damageLevel: new StringField({
          required: true,
          initial: "m",
        }),
        damageLevelModifier: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      limits: new SchemaField({
        exclusive: new BooleanField({
          required: true,
          initial: false,
        }),
      }),
    };
  }
}

type SpellSchema = {
  type: StringField;
  category: StringField;
  manipulationSubtype: StringField;
  range: StringField;
  duration: SchemaField<{
    type: StringField;
    rounds: NumberField;
  }>;
  learnedForce: NumberField;
  targeting: SchemaField<{
    kind: StringField;
    attribute: StringField;
    staticTargetNumber: NumberField;
  }>;
  resistance: SchemaField<{
    attribute: StringField;
  }>;
  threshold: SchemaField<SpellThresholdFields>;
  elementalAttack: SchemaField<SpellElementalAttackFields>;
  drain: SchemaField<{
    powerModifier: NumberField;
    damageLevel: StringField;
    damageLevelModifier: NumberField;
  }>;
  limits: SchemaField<{
    exclusive: BooleanField;
  }>;
};
