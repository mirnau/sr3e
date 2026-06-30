import { totalNumber } from "../../models/common/modifiableNumber";
import type { Modifier } from "./modifierList";

type PhaseKey = string; // "${round}:${pass}:${actorId}"
type OOCEntry = { shots: number; timestamp: number };

const phaseMap = new Map<PhaseKey, number>();
const oocMap = new Map<string, OOCEntry[]>();

const OOC_WINDOW_MS = 3000;

type FireMode = "manual" | "semiauto" | "burst" | "fullauto" | "energy";
type WeaponCategory = "heavy" | "shotgun" | "mounted" | "standard";

type WeaponSystem = {
    mode?: string;
    category?: WeaponCategory;
    recoilComp?: unknown;
};

type CombatData = { active?: boolean; round?: number; pass?: number };

function activeCombat(): CombatData | null {
    if (typeof game === "undefined") return null;
    const c = game.combat as unknown as CombatData | null | undefined;
    return c?.active ? c : null;
}

function currentPhaseKey(actorId: string): PhaseKey {
    const c = activeCombat();
    if (!c) return `ooc:${actorId}`;
    return `${c.round ?? 0}:${c.pass ?? 0}:${actorId}`;
}

export function inCombat(): boolean {
    return activeCombat() !== null;
}

export function getPhaseShots(actorId: string): number {
    return phaseMap.get(currentPhaseKey(actorId)) ?? 0;
}

export function bumpPhaseShots(actorId: string, count = 1): void {
    const key = currentPhaseKey(actorId);
    phaseMap.set(key, (phaseMap.get(key) ?? 0) + count);
}

export function getOOCShots(actorId: string): number {
    const now = Date.now();
    const entries = (oocMap.get(actorId) ?? []).filter(e => now - e.timestamp < OOC_WINDOW_MS);
    oocMap.set(actorId, entries);
    return entries.reduce((s, e) => s + e.shots, 0);
}

export function bumpOOCShots(actorId: string, count = 1): void {
    const entries = oocMap.get(actorId) ?? [];
    entries.push({ shots: count, timestamp: Date.now() });
    oocMap.set(actorId, entries);
}

export function resetRecoil(actorId: string): void {
    phaseMap.delete(currentPhaseKey(actorId));
    oocMap.delete(actorId);
}

export function resetAllRecoil(actorId: string): void {
    for (const key of phaseMap.keys()) {
        if (key.endsWith(`:${actorId}`)) phaseMap.delete(key);
    }
    oocMap.delete(actorId);
}

function recoilMultiplier(weapon: { system: Record<string, unknown> }, fireMode: FireMode): number {
    const ws = weapon.system as WeaponSystem;
    if (ws.category === "mounted") return 0.5;
    if (ws.category === "heavy") return 2;
    if (ws.category === "shotgun" && fireMode === "burst") return 2;
    return 1;
}

export function recoilModifier(
    actorId: string,
    weapon: { system: Record<string, unknown> },
    declaredRounds: number,
): Modifier | null {
    const ws = weapon.system as WeaponSystem;
    const mode = (ws.mode ?? "manual") as FireMode;
    const priorShots = inCombat() ? getPhaseShots(actorId) : getOOCShots(actorId);
    const mult = recoilMultiplier(weapon, mode);

    let rawPenalty = 0;

    switch (mode) {
        case "manual":
        case "energy":
            rawPenalty = 0;
            break;
        case "semiauto":
            rawPenalty = priorShots >= 1 ? 1 : 0;
            break;
        case "burst":
            rawPenalty = declaredRounds === 2 ? 2 : priorShots + 3;
            break;
        case "fullauto":
            rawPenalty = priorShots;
            break;
    }

    const penalty = Math.max(0, Math.floor(rawPenalty * mult) - totalNumber(ws.recoilComp, 0));
    if (penalty === 0) return null;
    return { name: "recoil", value: penalty };
}
