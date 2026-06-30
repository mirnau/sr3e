import { localize } from "../utilities";

export type GadgetPropertyKind = "stat-mod" | "override";
export type GadgetChangeType = "add" | "subtract" | "override";

export type GadgetPropertyOption = {
    value: string;
    label: string;
    kind: GadgetPropertyKind;
    changeTypes: GadgetChangeType[];
};

type GadgetTargetDefinition = {
    itemType: string;
    label: () => string;
    properties: () => GadgetPropertyOption[];
};

const LEGACY_TARGETS: Record<string, string> = {
    weaponmod: "weapon",
};

const GADGET_TARGETS: Record<string, GadgetTargetDefinition> = {
    weapon: {
        itemType: "weapon",
        label: () => localize(CONFIG.SR3E.ITEM_TYPES.weapon),
        properties: weaponProperties,
    },
};

export function gadgetTargetOptions(): { value: string; label: string }[] {
    return Object.values(GADGET_TARGETS).map(target => ({
        value: target.itemType,
        label: target.label(),
    }));
}

export function normalizeGadgetTargetItemType(raw: unknown): string {
    const value = String(raw ?? "");
    return LEGACY_TARGETS[value] ?? value;
}

export function knownGadgetTargetItemType(raw: unknown): string | undefined {
    const target = normalizeGadgetTargetItemType(raw);
    return GADGET_TARGETS[target] ? target : undefined;
}

export function gadgetTargetLabel(raw: unknown): string {
    const target = knownGadgetTargetItemType(raw);
    const definition = target ? GADGET_TARGETS[target] : undefined;
    return definition ? definition.label() : String(raw ?? "");
}

export function gadgetTargetFromDocument(document: Item | Actor): string | undefined {
    return (document as any).type === "gadget"
        ? knownGadgetTargetItemType((document as any).system?.type)
        : knownGadgetTargetItemType((document as any).type);
}

export function gadgetTargetFromEffect(effect: ActiveEffect): string | undefined {
    const flags = (effect as any).flags?.sr3e?.gadget ?? {};
    return knownGadgetTargetItemType(flags.targetItemType ?? flags.gadgetType);
}

export function gadgetTargetProperties(raw: unknown): GadgetPropertyOption[] {
    const target = knownGadgetTargetItemType(raw);
    const definition = target ? GADGET_TARGETS[target] : undefined;
    return definition ? definition.properties() : [];
}

function stat(path: string, label: string): GadgetPropertyOption {
    return { value: path, label, kind: "stat-mod", changeTypes: ["add", "subtract"] };
}

function override(path: string, label: string): GadgetPropertyOption {
    return { value: path, label, kind: "override", changeTypes: ["override"] };
}

function weaponProperties(): GadgetPropertyOption[] {
    return [
        override("system.mode", localize(CONFIG.SR3E.WEAPON.mode)),
        override("system.damageType", localize(CONFIG.SR3E.WEAPON.damageType)),
        override("system.ammunitionClass", localize(CONFIG.SR3E.WEAPON.ammunitionClass)),
        override("system.reloadMechanism", localize(CONFIG.SR3E.WEAPON.reloadMechanism)),
        stat("system.damage.mod", localize(CONFIG.SR3E.WEAPON.damage)),
        stat("system.range.mod", localize(CONFIG.SR3E.WEAPON.range)),
        stat("system.recoilComp.mod", localize(CONFIG.SR3E.WEAPON.recoilCompensation)),
        stat("system.rangeBand.short.mod", rangeBandLabel(CONFIG.SR3E.WEAPON.rangebandshort)),
        stat("system.rangeBand.medium.mod", rangeBandLabel(CONFIG.SR3E.WEAPON.rangebandmedium)),
        stat("system.rangeBand.long.mod", rangeBandLabel(CONFIG.SR3E.WEAPON.rangebandlong)),
        stat("system.rangeBand.extreme.mod", rangeBandLabel(CONFIG.SR3E.WEAPON.rangebandextreme)),
        stat("system.roll.targetNumber.mod", "Target Number"),
    ];
}

function rangeBandLabel(key: string): string {
    return `${localize(CONFIG.SR3E.WEAPON.rangeband)} - ${localize(key)}`;
}
