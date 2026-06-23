type FireMode = "ss" | "sa" | "bf" | "fa";

type WeaponSystem = {
    ammoId?: string;
    fireMode?: FireMode;
    ammunitionClass?: string;
};

export type WeaponClass = {
    isFirearm: boolean;
    isMelee: boolean;
    mode: string;
    ammoAvailable: number | null;
    declaredRounds: number;
};

export function classifyWeapon(
    weapon: { system: Record<string, unknown> },
    ammoAvailable: number | null = null,
): WeaponClass {
    const ws = weapon.system as WeaponSystem;
    const mode = ws.fireMode ?? "ss";

    const isFirearm = !!(ws.ammoId || ws.ammunitionClass || ws.fireMode);
    const isMelee = !isFirearm;

    let declaredRounds = 1;
    if (isFirearm) {
        if (mode === "bf") {
            declaredRounds = Math.min(3, ammoAvailable ?? 3);
        } else if (mode === "fa") {
            const available = ammoAvailable ?? 6;
            declaredRounds = Math.min(Math.max(3, available), 10);
        }
    }

    return { isFirearm, isMelee, mode, ammoAvailable, declaredRounds };
}
