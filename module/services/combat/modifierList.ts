export type Modifier = {
    id?: string;
    name: string;
    value: number;
    poolCap?: number;
    forbidPool?: boolean;
    meta?: Record<string, unknown>;
};

export function upsertMod(mods: Modifier[], mod: Modifier): Modifier[] {
    const idx = mods.findIndex(m => mod.id ? m.id === mod.id : m.name === mod.name);
    if (idx === -1) return [...mods, mod];
    return mods.map((m, i) => i === idx ? mod : m);
}

export function removeMod(mods: Modifier[], id: string): Modifier[] {
    return mods.filter(m => m.id !== id);
}

export function sumMods(mods: Modifier[]): number {
    return mods.reduce((sum, m) => sum + m.value, 0);
}

export function poolCap(mods: Modifier[]): number {
    const caps = mods.filter(m => m.poolCap !== undefined).map(m => m.poolCap!);
    return caps.length === 0 ? Infinity : Math.min(...caps);
}

export function poolForbidden(mods: Modifier[]): boolean {
    return mods.some(m => m.forbidPool === true);
}
