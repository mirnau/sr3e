import DicePoolStat from "./DicePoolStat";

type DicePoolsSchema = {
    combat: EmbeddedDataField<typeof DicePoolStat>;
    astral: EmbeddedDataField<typeof DicePoolStat>;
    hacking: EmbeddedDataField<typeof DicePoolStat>;
    control: EmbeddedDataField<typeof DicePoolStat>;
    spell: EmbeddedDataField<typeof DicePoolStat>;
};

export default class DicePoolsModel extends foundry.abstract.DataModel<DicePoolsSchema> {
    static defineSchema(): DicePoolsSchema {
        return {
            combat: new EmbeddedDataField(DicePoolStat),
            astral: new EmbeddedDataField(DicePoolStat),
            hacking: new EmbeddedDataField(DicePoolStat),
            control: new EmbeddedDataField(DicePoolStat),
            spell: new EmbeddedDataField(DicePoolStat),
        };
    }
}
