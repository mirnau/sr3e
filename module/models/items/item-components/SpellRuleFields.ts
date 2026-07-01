import { SPELL_THRESHOLD_MODE_KEYS } from "../../../../lang/config/MagicConfig";

const SPELL_THRESHOLD_MODE_CHOICES = [...SPELL_THRESHOLD_MODE_KEYS];

export function defineThresholdSchema() {
  return new SchemaField({
    mode: new StringField({
      required: true,
      initial: "none",
      choices: SPELL_THRESHOLD_MODE_CHOICES,
    }),
    attribute: new StringField({
      required: true,
      initial: "willpower",
    }),
    divisor: new NumberField({
      required: true,
      initial: 2,
      integer: true,
      min: 1,
    }),
    value: new NumberField({
      required: true,
      initial: 0,
      integer: true,
    }),
  });
}

export function defineElementalAttackSchema() {
  return new SchemaField({
    targetNumber: new NumberField({
      required: true,
      initial: 4,
      integer: true,
    }),
    canDodge: new BooleanField({
      required: true,
      initial: true,
    }),
    armorMultiplier: new NumberField({
      required: true,
      initial: 0.5,
    }),
  });
}

export type SpellThresholdFields = {
  mode: StringField;
  attribute: StringField;
  divisor: NumberField;
  value: NumberField;
};

export type SpellElementalAttackFields = {
  targetNumber: NumberField;
  canDodge: BooleanField;
  armorMultiplier: NumberField;
};
