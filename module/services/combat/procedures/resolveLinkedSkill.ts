type SkillSystem = {
    value?: number;
    linkedAttribute?: string;
    specializations?: Array<{ value?: number; name?: string }>;
};

type Item = { id: string; type: string; system: Record<string, unknown> };
type Actor = { items: { get?: (id: string) => Item | undefined; contents?: Item[] } };

export type LinkedSkillResolution = {
    skillId: string;
    specIndex: number | null;
    skill: Item;
    dice: number;
    linkedAttribute: string | null;
    specName: string | null;
};

export function parseLinkedSkillId(id: string): { skillId: string; specIndex: number | null } {
    if (!id) return { skillId: "", specIndex: null };
    const sep = id.indexOf("::");
    if (sep === -1) return { skillId: id, specIndex: null };
    const specIndex = parseInt(id.slice(sep + 2), 10);
    return { skillId: id.slice(0, sep), specIndex: isNaN(specIndex) ? null : specIndex };
}

export function resolveLinkedSkill(
    actor: Actor,
    linkedSkillId: string,
): LinkedSkillResolution | null {
    const { skillId, specIndex } = parseLinkedSkillId(linkedSkillId);
    if (!skillId) return null;

    const skill = actor.items.get?.(skillId) ?? actor.items.contents?.find(i => i.id === skillId);
    if (!skill) return null;

    const ss = skill.system as SkillSystem;
    const baseRating = ss.value ?? 0;

    let dice = baseRating;
    let specName: string | null = null;

    if (specIndex !== null && ss.specializations?.[specIndex] !== undefined) {
        const spec = ss.specializations[specIndex];
        dice = spec.value ?? baseRating;
        specName = spec.name ?? null;
    }

    return {
        skillId,
        specIndex,
        skill,
        dice,
        linkedAttribute: ss.linkedAttribute ?? null,
        specName,
    };
}
