// @common/RangeService.js
export const RangeBand = Object.freeze({
  Short: "short",
  Medium: "medium",
  Long: "long",
  Extreme: "extreme",
});

const BASE_TN_BY_BAND = Object.freeze({
  short: 4,
  medium: 5,
  long: 6,
  extreme: 9,
});

function measureDistanceBetweenTokens(attackerToken, targetToken) {
  if (!attackerToken || !targetToken) throw new Error("sr3e: tokens required for distance");
  const p1 = { x: attackerToken.center.x, y: attackerToken.center.y };
  const p2 = { x: targetToken.center.x, y: targetToken.center.y };
  const d = canvas.grid.measureDistance(p1, p2);
  return Math.max(0, Number(d) || 0); // assume scene distance unit = meters
}

function getWeaponRangeTable(weapon) {
  const rb = weapon?.system?.rangeBand ?? {};
  const shortMax   = Number(rb.short)   || 0;
  const mediumMax  = Number(rb.medium)  || 0;
  const longMax    = Number(rb.long)    || 0;
  const extremeMax = Number(rb.extreme) || 0;

  if (!shortMax || !mediumMax || !longMax || !extremeMax) {
    throw new Error(`sr3e: weapon "${weapon?.name}" missing rangeBand.* values`);
  }
  return { shortMax, mediumMax, longMax, extremeMax };
}

function rawBandForDistance(distance, table) {
  if (distance <= table.shortMax)   return "short";
  if (distance <= table.mediumMax)  return "medium";
  if (distance <= table.longMax)    return "long";
  if (distance <= table.extremeMax) return "extreme";
  return null; // out of range
}

function applyLeftShift(band, shiftLeft = 0) {
  if (!band) return null;
  const order = ["short", "medium", "long", "extreme"];
  const i = order.indexOf(band);
  if (i < 0) return band;
  const n = Math.max(0, i - Math.max(0, Number(shiftLeft) || 0));
  return order[n];
}

export function tnDeltaFromShort(band) {
  // Short is base 4; return delta to add as a visible modifier
  if (band === "short") return 0;     // 4 - 4
  if (band === "medium") return 1;    // 5 - 4
  if (band === "long") return 2;      // 6 - 4
  if (band === "extreme") return 5;   // 9 - 4
  return 0;
}

export default class RangeService {
  static resolve({ weapon, attackerToken, targetToken, shiftLeft = 0 }) {
    const distance = measureDistanceBetweenTokens(attackerToken, targetToken);
    const table = getWeaponRangeTable(weapon);
    const raw = rawBandForDistance(distance, table);
    const band = applyLeftShift(raw, shiftLeft);
    const baseTN = band ? BASE_TN_BY_BAND[band] : null;
    return { distance, band, baseTN, table, rawBand: raw };
  }

  static modifierForComposer({ weapon, attackerToken, targetToken, shiftLeft = 0 }) {
    const r = this.resolve({ weapon, attackerToken, targetToken, shiftLeft });
    if (!r.band) {
      return { id: "range", name: "Range (Out of range)", value: 999, meta: { distance: r.distance } };
    }
    const delta = tnDeltaFromShort(r.band);
    return delta
      ? { id: "range", name: `Range (${r.band})`, value: delta, meta: { distance: r.distance } }
      : null;
  }
}
