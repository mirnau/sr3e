export type WeaponMode = "manual" | "semiauto" | "burst" | "fullauto" | "energy" | "blade" | "blunt" | "explosive";

const FIREARM_MODES = new Set<WeaponMode>(["manual", "semiauto", "burst", "fullauto", "energy"]);
const MELEE_MODES = new Set<WeaponMode>(["blade", "blunt"]);

type WeaponSystem = { mode?: string; ammoId?: string };

export type WeaponClass = {
    isFirearm: boolean;
    isMelee: boolean;
    isExplosive: boolean;
    mode: WeaponMode | "";
    ammoAvailable: number | null;
    declaredRounds: number;
};

export function classifyWeapon(
    weapon: { system: Record<string, unknown> },
    ammoAvailable: number | null = null,
): WeaponClass {
    const ws = weapon.system as WeaponSystem;
    const mode = (ws.mode ?? "") as WeaponMode | "";

    const isFirearm = FIREARM_MODES.has(mode as WeaponMode);
    const isMelee = MELEE_MODES.has(mode as WeaponMode);
    const isExplosive = mode === "explosive";

    let declaredRounds = 1;
    if (isFirearm) {
        if (mode === "burst") {
            declaredRounds = Math.min(3, ammoAvailable ?? 3);
        } else if (mode === "fullauto") {
            const available = ammoAvailable ?? 6;
            declaredRounds = Math.min(Math.max(3, available), 10);
        }
    }

    return { isFirearm, isMelee, isExplosive, mode, ammoAvailable, declaredRounds };
}
