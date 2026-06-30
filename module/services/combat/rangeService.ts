import { totalNumber } from "../../models/common/modifiableNumber";
import type { Modifier } from "./modifierList";

export type RangeBand = "short" | "medium" | "long" | "extreme";

export type RangeResolution = {
    distance: number;
    rawBand: RangeBand | null;
    band: RangeBand | null;
    baseTN: number | null;
};

export const BASE_TN: Record<RangeBand, number> = {
    short: 4, medium: 5, long: 6, extreme: 9,
};

const BAND_ORDER: RangeBand[] = ["short", "medium", "long", "extreme"];

type WeaponRanges = {
    rangeBand?: Partial<Record<RangeBand, unknown>>;
    short?: unknown;
    medium?: unknown;
    long?: unknown;
    extreme?: unknown;
    minimumRange?: number;
};

type MeasureFn = (from: { x: number; y: number }, to: { x: number; y: number }) => { distance: number };

function bandForDistance(ranges: WeaponRanges, distance: number): RangeBand | null {
    const source = ranges.rangeBand ?? ranges;
    if (distance <= totalNumber(source.short, 0)) return "short";
    if (distance <= totalNumber(source.medium, 0)) return "medium";
    if (distance <= totalNumber(source.long, 0)) return "long";
    if (distance <= totalNumber(source.extreme, 0)) return "extreme";
    return null;
}

function shiftBandLeft(band: RangeBand, shift: number): RangeBand {
    const idx = Math.max(0, BAND_ORDER.indexOf(band) - shift);
    return BAND_ORDER[idx]!;
}

export function resolveRange(
    weapon: { system: Record<string, unknown> },
    attackerToken: { x: number; y: number },
    targetToken: { x: number; y: number },
    shiftLeft = 0,
    measure: MeasureFn = (a, b) => ({ distance: Math.hypot(b.x - a.x, b.y - a.y) }),
): RangeResolution {
    const ws = weapon.system as WeaponRanges;
    const { distance } = measure(attackerToken, targetToken);

    if (ws.minimumRange !== undefined && distance < ws.minimumRange) {
        return { distance, rawBand: null, band: null, baseTN: null };
    }

    const rawBand = bandForDistance(ws, distance);
    if (rawBand === null) return { distance, rawBand: null, band: null, baseTN: null };

    const band = shiftLeft > 0 ? shiftBandLeft(rawBand, shiftLeft) : rawBand;
    return { distance, rawBand, band, baseTN: BASE_TN[band] };
}

export function rangeTNDelta(band: RangeBand): number {
    return BASE_TN[band] - BASE_TN.short;
}

export function rangeModifier(resolution: RangeResolution): Modifier | null {
    if (resolution.band === null) return { name: "out-of-range", value: 999 };
    if (resolution.band === "short") return null;
    return { name: `range-${resolution.band}`, value: rangeTNDelta(resolution.band) };
}
