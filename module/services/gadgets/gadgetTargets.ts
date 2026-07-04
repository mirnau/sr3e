import { localize } from "../utilities";
import { spellProperties } from "./spellGadgetProperties";

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
    wearable: {
        itemType: "wearable",
        label: () => localize(CONFIG.SR3E.ITEM_TYPES.wearable),
        properties: wearableProperties,
    },
    fetish: {
        itemType: "spell",
        label: () => localize(CONFIG.SR3E.GADGET_TYPES.fetish),
        properties: spellProperties,
    },
    medical: {
        itemType: "medical",
        label: () => localize(CONFIG.SR3E.ITEM_TYPES.medical),
        properties: medicalProperties,
    },
    mechanical: {
        itemType: "mechanical",
        label: () => localize(CONFIG.SR3E.ACTOR_TYPES.mechanical),
        properties: mechanicalProperties,
    },
};

export function gadgetTargetOptions(): { value: string; label: string }[] {
    return Object.entries(GADGET_TARGETS).map(([key, target]) => ({
        value: key,
        label: target.label(),
    }));
}

export function normalizeGadgetTargetItemType(raw: unknown): string {
    const value = String(raw ?? "");
    return LEGACY_TARGETS[value] ?? value;
}

export function knownGadgetTargetItemType(raw: unknown): string | undefined {
    return gadgetTargetDefinition(raw)?.itemType;
}

export function gadgetTargetLabel(raw: unknown): string {
    const definition = gadgetTargetDefinition(raw);
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
    const definition = gadgetTargetDefinition(raw);
    return definition ? definition.properties() : [];
}

function gadgetTargetDefinition(raw: unknown): GadgetTargetDefinition | undefined {
    const target = normalizeGadgetTargetItemType(raw);
    return GADGET_TARGETS[target] ?? Object.values(GADGET_TARGETS).find(definition => definition.itemType === target);
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

function wearableProperties(): GadgetPropertyOption[] {
    return [
        stat("system.ballistic", localize(CONFIG.SR3E.WEARABLE.ballistic)),
        stat("system.impact", localize(CONFIG.SR3E.WEARABLE.impact)),
        override("system.canLayer", localize(CONFIG.SR3E.WEARABLE.canlayer)),
    ];
}

function medicalProperties(): GadgetPropertyOption[] {
    return [
        stat("system.health.stun.value",    localize(CONFIG.SR3E.HEALTH.stun)),
        stat("system.health.physical.value", localize(CONFIG.SR3E.HEALTH.physical)),
        stat("system.health.overflow.value", localize(CONFIG.SR3E.HEALTH.overflow)),
        stat("system.health.penalty.value",  localize(CONFIG.SR3E.HEALTH.penalty)),
        stat("system.attributes.body.mod",          localize(CONFIG.SR3E.ATTRIBUTES.body)),
        stat("system.attributes.quickness.mod",     localize(CONFIG.SR3E.ATTRIBUTES.quickness)),
        stat("system.attributes.strength.mod",      localize(CONFIG.SR3E.ATTRIBUTES.strength)),
        stat("system.attributes.charisma.mod",      localize(CONFIG.SR3E.ATTRIBUTES.charisma)),
        stat("system.attributes.intelligence.mod",  localize(CONFIG.SR3E.ATTRIBUTES.intelligence)),
        stat("system.attributes.willpower.mod",     localize(CONFIG.SR3E.ATTRIBUTES.willpower)),
        stat("system.attributes.reaction.mod",      localize(CONFIG.SR3E.ATTRIBUTES.reaction)),
        stat("system.movement.walking.mod",  localize(CONFIG.SR3E.MOVEMENT.walking)),
        stat("system.movement.running.mod",  localize(CONFIG.SR3E.MOVEMENT.running)),
        stat("system.dicePools.combat.mod",  localize(CONFIG.SR3E.DICE_POOLS.combat)),
        stat("system.dicePools.astral.mod",  localize(CONFIG.SR3E.DICE_POOLS.astral)),
        stat("system.dicePools.hacking.mod", localize(CONFIG.SR3E.DICE_POOLS.hacking)),
        stat("system.dicePools.control.mod", localize(CONFIG.SR3E.DICE_POOLS.control)),
        stat("system.dicePools.spell.mod",   localize(CONFIG.SR3E.DICE_POOLS.spell)),
    ];
}

function mechanicalProperties(): GadgetPropertyOption[] {
    return [
        stat("system.handling.mod", localize(CONFIG.SR3E.MECHANICAL.handling)),
        stat("system.handlingRoad.mod", localize(CONFIG.SR3E.MECHANICAL.handlingRoad)),
        stat("system.handlingOffRoad.mod", localize(CONFIG.SR3E.MECHANICAL.handlingOffRoad)),
        stat("system.currentSpeed.mod", localize(CONFIG.SR3E.MECHANICAL.currentSpeed)),
        stat("system.speedRating.mod", localize(CONFIG.SR3E.MECHANICAL.speedRating)),
        stat("system.maxSpeed.mod", localize(CONFIG.SR3E.MECHANICAL.maxSpeed)),
        stat("system.speedStall.mod", localize(CONFIG.SR3E.MECHANICAL.speedStall)),
        stat("system.accel.mod", localize(CONFIG.SR3E.MECHANICAL.accel)),
        stat("system.body.mod", localize(CONFIG.SR3E.MECHANICAL.body)),
        stat("system.armor.mod", localize(CONFIG.SR3E.MECHANICAL.armor)),
        stat("system.signature.mod", localize(CONFIG.SR3E.MECHANICAL.signature)),
        stat("system.autonav.mod", localize(CONFIG.SR3E.MECHANICAL.autonav)),
        stat("system.pilot.mod", localize(CONFIG.SR3E.MECHANICAL.pilot)),
        stat("system.sensor.mod", localize(CONFIG.SR3E.MECHANICAL.sensor)),
        stat("system.ecm.mod", localize(CONFIG.SR3E.MECHANICAL.ecm)),
        stat("system.eccm.mod", localize(CONFIG.SR3E.MECHANICAL.eccm)),
        stat("system.flux.mod", localize(CONFIG.SR3E.MECHANICAL.flux)),
        stat("system.cargo.mod", localize(CONFIG.SR3E.MECHANICAL.cargo)),
        stat("system.load.mod", localize(CONFIG.SR3E.MECHANICAL.load)),
        stat("system.speedTurbo.mod", localize(CONFIG.SR3E.MECHANICAL.speedTurbo)),
        stat("system.accelTurbo.mod", localize(CONFIG.SR3E.MECHANICAL.accelTurbo)),
        stat("system.mounts.firmpoints.mod", localize(CONFIG.SR3E.MECHANICAL.firmpoints)),
        stat("system.mounts.hardpoints.mod", localize(CONFIG.SR3E.MECHANICAL.hardpoints)),
        stat("system.mounts.turrets.mod", localize(CONFIG.SR3E.MECHANICAL.turrets)),
        stat("system.mounts.externalFixed.mod", localize(CONFIG.SR3E.MECHANICAL.externalFixed)),
        stat("system.mounts.internalFixed.mod", localize(CONFIG.SR3E.MECHANICAL.internalFixed)),
        stat("system.mounts.pintles.mod", localize(CONFIG.SR3E.MECHANICAL.pintles)),
        stat("system.mounts.miniTurrets.mod", localize(CONFIG.SR3E.MECHANICAL.miniTurrets)),
    ];
}

function rangeBandLabel(key: string): string {
    return `${localize(CONFIG.SR3E.WEAPON.rangeband)} - ${localize(key)}`;
}
