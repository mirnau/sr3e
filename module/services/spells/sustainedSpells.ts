const FLAG_SCOPE = "sr3e";
const FLAG_KEY = "sustainedSpells";

export type SustainedSpell = {
    id: string;
    spellId: string | null;
    spellName: string;
    force: number;
    sustainingFocusId: string | null;
    appliedEffectUuid: string | null;
};

type ActorLike = {
    getFlag?: (scope: string, key: string) => unknown;
    setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
};

type FocusLike = {
    id?: string;
    system?: { force?: number };
};

export type EffectTargetActor = {
    createEmbeddedDocuments?: (type: string, data: unknown[]) => Promise<Array<{ uuid?: string }>>;
};

export function listSustainedSpells(actor: ActorLike): SustainedSpell[] {
    return (actor.getFlag?.(FLAG_SCOPE, FLAG_KEY) as SustainedSpell[] | undefined) ?? [];
}

export function selfSustainedSpells(actor: ActorLike): SustainedSpell[] {
    return listSustainedSpells(actor).filter(entry => !entry.sustainingFocusId);
}

export function sustainingTnPenalty(actor: ActorLike): number {
    return selfSustainedSpells(actor).length * 2;
}

export function sustainingDrainPower(actor: ActorLike): number {
    return selfSustainedSpells(actor).length * 2;
}

export async function addSustainedSpell(
    actor: ActorLike,
    entry: Omit<SustainedSpell, "id" | "appliedEffectUuid">,
): Promise<SustainedSpell> {
    const sustained: SustainedSpell = { id: randomId(), appliedEffectUuid: null, ...entry };
    await actor.setFlag?.(FLAG_SCOPE, FLAG_KEY, [...listSustainedSpells(actor), sustained]);
    return sustained;
}

export async function dropSustainedSpell(actor: ActorLike, sustainedId: string): Promise<void> {
    const entry = listSustainedSpells(actor).find(item => item.id === sustainedId);
    if (entry?.appliedEffectUuid) await deleteEffectByUuid(entry.appliedEffectUuid);
    const remaining = listSustainedSpells(actor).filter(item => item.id !== sustainedId);
    await actor.setFlag?.(FLAG_SCOPE, FLAG_KEY, remaining);
}

export async function attachSustainedEffect(
    actor: ActorLike,
    targetActor: EffectTargetActor,
    sustainedId: string,
    targetPath: string,
    value: number,
    label: string,
): Promise<void> {
    const [created] = (await targetActor.createEmbeddedDocuments?.("ActiveEffect", [{
        name: label,
        changes: [{ key: targetPath, type: "add", value: String(value), priority: 0 }],
        flags: { sr3e: { sustainedSpellId: sustainedId } },
    }])) ?? [];
    if (!created?.uuid) return;

    const list = listSustainedSpells(actor).map(entry =>
        entry.id === sustainedId ? { ...entry, appliedEffectUuid: created.uuid ?? null } : entry
    );
    await actor.setFlag?.(FLAG_SCOPE, FLAG_KEY, list);
}

async function deleteEffectByUuid(uuid: string): Promise<void> {
    const effect = await fromUuid(uuid).catch(() => null);
    await (effect as { delete?: () => Promise<unknown> } | null)?.delete?.();
}

export function canSustainInFocus(focus: FocusLike, spellForce: number): boolean {
    return spellForce <= Number(focus.system?.force ?? 0);
}

export async function sustainSpellInFocus(
    actor: ActorLike,
    focus: FocusLike,
    spell: { id?: string; name?: string },
    force: number,
): Promise<SustainedSpell | null> {
    if (!canSustainInFocus(focus, force)) return null;
    return addSustainedSpell(actor, {
        spellId: spell.id ?? null,
        spellName: spell.name ?? "Spell",
        force,
        sustainingFocusId: focus.id ?? null,
    });
}

function randomId(): string {
    return typeof foundry !== "undefined" ? foundry.utils.randomID() : Math.random().toString(36).slice(2);
}

export function registerSustainedSpellCleanupHook(): void {
    Hooks.on("deleteActiveEffect", async (effect: { flags?: { sr3e?: { sustainedSpellId?: string } } }) => {
        const sustainedSpellId = effect?.flags?.sr3e?.sustainedSpellId;
        if (!sustainedSpellId) return;

        const owner = (game as { actors?: Iterable<ActorLike> }).actors as ActorLike[] | undefined;
        const caster = [...(owner ?? [])].find(actor =>
            listSustainedSpells(actor).some(entry => entry.id === sustainedSpellId)
        );
        if (!caster) return;

        const remaining = listSustainedSpells(caster).filter(entry => entry.id !== sustainedSpellId);
        await caster.setFlag?.(FLAG_SCOPE, FLAG_KEY, remaining);
    });
}
