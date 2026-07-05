import { gadgetTargetFromDocument, gadgetTargetFromEffect, gadgetTargetProperties, type GadgetPropertyOption } from "../../services/gadgets/gadgetTargets";
import { localize } from "../../services/utilities";

type PathSource = Record<string, unknown>;

type PropertyOptionContext = {
    document: Item | Actor;
    activeEffect: ActiveEffect;
    target: string;
};

export function activeEffectPropertyOptions(context: PropertyOptionContext): GadgetPropertyOption[] {
    if (context.target === "self") {
        const target = gadgetTargetFromEffect(context.activeEffect) ?? gadgetTargetFromDocument(context.document);
        const properties = gadgetTargetProperties(target);
        if (properties.length) return properties;
    }

    return Object.keys(pathSourceFor(context))
        .filter(isModPath)
        .map(path => ({ value: path, label: modPathLabel(path), kind: "stat-mod" as const, changeTypes: ["add" as const, "subtract" as const] }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

function pathSourceFor(context: PropertyOptionContext): PathSource {
    if (context.target === "character") return characterPathSource();
    return flattenedSystem((context.document as any).toObject?.()?.system ?? {});
}

function characterPathSource(): PathSource {
    return modelPathSource(CONFIG.Actor.dataModels["character"]);
}

function modelPathSource(model: unknown): PathSource {
    if (!model) return {};
    const instance = new (model as any)({});
    return flattenedSystem(instance.toObject?.() ?? {});
}

function flattenedSystem(system: unknown): PathSource {
    return foundry.utils.flattenObject({ system }) as PathSource;
}

function isModPath(path: string): boolean { return path.endsWith(".mod"); }

// Raw dot-paths (e.g. "system.attributes.body.mod") are meaningless to a
// player — show just the stat name, reusing its existing localization
// where one exists (attributes/movement/dice pools all share their key
// names 1:1 with CONFIG.SR3E category keys), falling back to a humanized
// version of the segment right before ".mod" otherwise.
const MOD_LABEL_CATEGORIES = ["ATTRIBUTES", "MOVEMENT", "DICE_POOLS"] as const;

function modPathLabel(path: string): string {
    const segments = path.replace(/\.mod$/, "").split(".");
    const key = segments[segments.length - 1] ?? path;

    for (const category of MOD_LABEL_CATEGORIES) {
        const token = (CONFIG.SR3E as unknown as Record<string, Record<string, string>>)[category]?.[key];
        if (token) return localize(token);
    }

    return humanize(key);
}

function humanize(key: string): string {
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());
}
