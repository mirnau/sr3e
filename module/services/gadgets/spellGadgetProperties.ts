import { localize } from "../utilities";
import type { GadgetPropertyOption } from "./gadgetTargets";

function stat(path: string, label: string): GadgetPropertyOption {
    return { value: path, label, kind: "stat-mod", changeTypes: ["add", "subtract"] };
}

function override(path: string, label: string): GadgetPropertyOption {
    return { value: path, label, kind: "override", changeTypes: ["override"] };
}

export function spellProperties(): GadgetPropertyOption[] {
    return [
        override("system.limits.exclusive", localize(CONFIG.SR3E.SPELL.exclusiveCast)),
        stat("system.drain.powerModifier", localize(CONFIG.SR3E.SPELL.drainPowerModifier)),
        stat("system.drain.damageLevelModifier", localize(CONFIG.SR3E.SPELL.drainDamageLevelModifier)),
        stat("system.elementalAttack.targetNumber", localize(CONFIG.SR3E.SPELL.attackTargetNumber)),
        stat("system.elementalAttack.armorMultiplier", localize(CONFIG.SR3E.SPELL.armorMultiplier)),
    ];
}
