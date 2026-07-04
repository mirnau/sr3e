const MODULE_ID = "sr3e";
const REM_SIZE = "remSizePx";

export const DEFAULT_REM_SIZE_PX = 16;
export const MIN_REM_SIZE_PX = 8;
export const MAX_REM_SIZE_PX = 32;

export const remSizeSettingKeys = {
    moduleId: MODULE_ID,
    remSize: REM_SIZE,
} as const;

export function normalizeRemSize(value: unknown): number {
    const size = Math.round(Number(value));
    if (!Number.isFinite(size)) return DEFAULT_REM_SIZE_PX;
    return Math.max(MIN_REM_SIZE_PX, Math.min(MAX_REM_SIZE_PX, size));
}

export function getRemSize(): number {
    return normalizeRemSize((game.settings as any).get(MODULE_ID, REM_SIZE));
}

export async function setRemSize(value: unknown): Promise<void> {
    await (game.settings as any).set(MODULE_ID, REM_SIZE, normalizeRemSize(value));
}

export async function resetRemSize(): Promise<void> {
    await setRemSize(DEFAULT_REM_SIZE_PX);
}

export function applyRemSize(value: unknown): void {
    document.documentElement.style.fontSize = `${normalizeRemSize(value)}px`;
}
