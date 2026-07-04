import type { GadgetChangeType } from "../gadgets/gadgetTargets";

export type ActiveEffectChangeDraft = {
    key: string;
    type: GadgetChangeType;
    value: string;
    priority: number;
};

type ActiveEffectChangeSource = {
    key?: unknown;
    type?: unknown;
    value?: unknown;
    priority?: unknown;
};

export type ActiveEffectChangeData = {
    key: string;
    type: GadgetChangeType;
    value: string;
    priority: number;
};

export function normalizeActiveEffectChange(change: ActiveEffectChangeSource): ActiveEffectChangeDraft {
    const type = normalizeChangeType(change);
    return {
        key: String(change.key ?? ""),
        type,
        value: type === "subtract" ? unsignedValue(change.value) : String(change.value ?? ""),
        priority: Number(change.priority ?? 0),
    };
}

export function activeEffectChangeData(change: ActiveEffectChangeDraft): ActiveEffectChangeData {
    return {
        key: change.key,
        type: change.type === "subtract" ? "add" : change.type,
        value: valueForType(change.type, change.value),
        priority: change.priority,
    };
}

function normalizeChangeType(change: ActiveEffectChangeSource): GadgetChangeType {
    if (change.type === "override") return "override";
    if (change.type === "subtract") return "subtract";
    // A non-positive value on an additive change is always framed as a
    // subtraction in this editor — including exactly zero, since a
    // zero-cost deduction (e.g. an uncosted VCR) should still read as
    // "subtract 0", not "add 0".
    if (Number(change.value) <= 0) return "subtract";
    return "add";
}

function valueForType(type: GadgetChangeType, value: string): string {
    if (type !== "subtract") return value;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return String(-Math.abs(numeric));
    return value.startsWith("-") ? value : `-${value}`;
}

function unsignedValue(value: unknown): string {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return String(Math.abs(numeric));
    return String(value ?? "").replace(/^-/, "");
}
