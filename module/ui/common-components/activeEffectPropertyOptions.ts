import { gadgetTargetFromDocument, gadgetTargetFromEffect, gadgetTargetProperties, type GadgetPropertyOption } from "../../services/gadgets/gadgetTargets";

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
        .map(path => ({ value: path, label: path, kind: "stat-mod" as const, changeTypes: ["add" as const, "subtract" as const] }))
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
