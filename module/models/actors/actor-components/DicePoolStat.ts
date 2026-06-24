type DicePoolStatSchema = {
    value: NumberField;
    mod: NumberField;
    spent: NumberField;
};

export default class DicePoolStat extends foundry.abstract.DataModel<DicePoolStatSchema> {
    static defineSchema(): DicePoolStatSchema {
        return {
            value: new NumberField({ required: true, initial: 0, integer: true }),
            mod: new NumberField({ required: true, initial: 0, integer: true }),
            spent: new NumberField({ required: true, initial: 0, integer: true }),
        };
    }
}
