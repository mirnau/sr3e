export type SkillSubSchema = {
    value?: number;
    linkedAttribute?: string;
    specializations?: Array<{ value?: number; name?: string }>;
};

export type SkillSystem = {
    skillType?: string;
    activeSkill?: SkillSubSchema;
    knowledgeSkill?: SkillSubSchema;
    languageSkill?: SkillSubSchema;
};

type Item = { id: string; name?: string; type: string; system: Record<string, unknown> };
type Actor = { items: { get?: (id: string) => Item | undefined; contents?: Item[] } };

export type LinkedSkillResolution = {
    skillId: string;
    specIndex: number | null;
    skill: Item;
    dice: number;
    linkedAttribute: string | null;
    specName: string | null;
    specHasOwnValue: boolean;
};

export function parseLinkedSkillId(id: string): { skillId: string; specIndex: number | null } {
    if (!id) return { skillId: "", specIndex: null };
    const sep = id.indexOf("::");
    if (sep === -1) return { skillId: id, specIndex: null };
    const specIndex = parseInt(id.slice(sep + 2), 10);
    return { skillId: id.slice(0, sep), specIndex: isNaN(specIndex) ? null : specIndex };
}

export function resolveSubSchema(system: SkillSystem): SkillSubSchema {
    const subKey = `${system.skillType ?? "active"}Skill` as keyof SkillSystem;
    return (system[subKey] as SkillSubSchema | undefined) ?? {};
}

export function resolveLinkedSkill(
    actor: Actor,
    linkedSkillId: string,
): LinkedSkillResolution | null {
    const { skillId, specIndex } = parseLinkedSkillId(linkedSkillId);
    if (!skillId) return null;

    const skill = actor.items.get?.(skillId) ?? actor.items.contents?.find(i => i.id === skillId);
    if (!skill) return null;

    const ss = resolveSubSchema(skill.system as SkillSystem);
    const baseRating = ss.value ?? 0;

    let dice = baseRating;
    let specName: string | null = null;
    let specHasOwnValue = false;

    if (specIndex !== null && ss.specializations?.[specIndex] !== undefined) {
        const spec = ss.specializations[specIndex];
        specHasOwnValue = spec.value !== undefined;
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
        specHasOwnValue,
    };
}

// Candidates for the "defaulting to a related skill/specialization" picker
// (SR3E p.84): every skill and specialization the actor owns that shares the
// same linkedAttribute as the skill being defaulted from — the "group"
// concept is honorary in this system (no formal skill-group model), left to
// the player/GM to judge which options actually make sense.
export type DefaultingCandidate = {
    linkedSkillId: string; // skillId, or "skillId::specIndex" for a specialization
    label: string;
    rating: number;
};

export function listDefaultingCandidates(
    actor: Actor,
    linkedAttributeKey: string,
    excludeSkillId: string | null,
): DefaultingCandidate[] {
    const skills = actor.items.contents ?? [];
    const candidates: DefaultingCandidate[] = [];

    for (const item of skills) {
        if (item.type !== "skill" || item.id === excludeSkillId) continue;
        const ss = resolveSubSchema(item.system as SkillSystem);
        if (ss.linkedAttribute !== linkedAttributeKey) continue;

        candidates.push({ linkedSkillId: item.id, label: item.name ?? "Skill", rating: ss.value ?? 0 });
        (ss.specializations ?? []).forEach((spec, i) => {
            candidates.push({
                linkedSkillId: `${item.id}::${i}`,
                label: `${item.name ?? "Skill"} — ${spec.name ?? "Specialization"}`,
                rating: spec.value ?? ss.value ?? 0,
            });
        });
    }

    return candidates;
}
