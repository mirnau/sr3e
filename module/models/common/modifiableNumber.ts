export type ModifiableNumberValue = {
  value?: number;
  mod?: number;
};

export function modifiableNumber(source: unknown, initial = 0): ModifiableNumberValue {
  if (typeof source === "number") return { value: source, mod: 0 };
  if (!isRecord(source)) return { value: initial, mod: 0 };
  return {
    value: Number(source.value ?? initial),
    mod: Number(source.mod ?? 0),
  };
}

export function baseNumber(source: unknown, fallback = 0): number {
  if (typeof source === "number") return source;
  if (!isRecord(source)) return fallback;
  return Number(source.value ?? fallback);
}

export function totalNumber(source: unknown, fallback = 0): number {
  if (typeof source === "number") return source;
  if (!isRecord(source)) return fallback;
  return Number(source.value ?? fallback) + Number(source.mod ?? 0);
}

function isRecord(source: unknown): source is Record<string, unknown> {
  return typeof source === "object" && source !== null;
}
