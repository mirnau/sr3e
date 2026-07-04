import type { Modifier } from "./modifierList";

export type TerrainCategory = "open" | "normal" | "restricted" | "tight";

// SR3 p.134/140 — Terrain Points feed into Maneuver Score; the Driving
// Test Modifier is a separate, always-applicable TN modifier for any
// driving test in that terrain (not gated on a Maneuver Score comparison).
const TERRAIN_TABLE: Record<TerrainCategory, { points: number; drivingTnMod: number }> = {
    open: { points: 0, drivingTnMod: -1 },
    normal: { points: -2, drivingTnMod: 0 },
    restricted: { points: -4, drivingTnMod: 1 },
    tight: { points: -10, drivingTnMod: 3 },
};

export function terrainPoints(terrain: TerrainCategory): number {
    return TERRAIN_TABLE[terrain].points;
}

// A visible named modifier, never a silent change to the base TN — same
// convention as the VCR and Maneuver Score comparison modifiers.
export function terrainDrivingModifier(terrain: TerrainCategory): Modifier[] {
    const mod = TERRAIN_TABLE[terrain].drivingTnMod;
    if (mod === 0) return [];
    return [{ id: "terrain-driving-modifier", name: "Terrain", value: mod }];
}
