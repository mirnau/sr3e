const RIGGER_BONUS_FLAG = "riggerJackInBonus";

type RiggerBonusEffect = {
    id: string;
    changes?: { key?: string; value?: unknown }[];
    flags?: { sr3e?: Record<string, unknown> };
};

type RiggerBonusActor = {
    img?: string;
    effects: { contents: RiggerBonusEffect[] };
    createEmbeddedDocuments: (documentName: string, data: Record<string, unknown>[], options?: Record<string, unknown>) => Promise<unknown>;
    deleteEmbeddedDocuments: (documentName: string, ids: string[], options?: Record<string, unknown>) => Promise<unknown>;
};

function findRiggerBonusEffect(actor: RiggerBonusActor): RiggerBonusEffect | undefined {
    return actor.effects.contents.find((effect) => effect.flags?.sr3e?.[RIGGER_BONUS_FLAG]);
}

function currentBonusLevel(effect: RiggerBonusEffect): number {
    const change = effect.changes?.find((c) => c.key === "system.attributes.initiative.mod");
    return Number(change?.value ?? NaN);
}

// Reaction/Initiative bonus while jacked into a vehicle (SR3 p.301: +2
// Reaction, +1D6 Initiative per VCR level) — expressed as an ActiveEffect
// rather than new roll-pipeline code, since SR3EActor.rollInitiative()
// already reads these two stats directly.
export async function syncRiggerBonusEffect(actor: RiggerBonusActor, jackedIn: boolean, vcrLevel: number): Promise<void> {
    const existing = findRiggerBonusEffect(actor);

    if (!jackedIn) {
        if (existing) await actor.deleteEmbeddedDocuments("ActiveEffect", [existing.id], { render: false });
        return;
    }

    if (existing && currentBonusLevel(existing) === vcrLevel) return;
    if (existing) await actor.deleteEmbeddedDocuments("ActiveEffect", [existing.id], { render: false });

    await actor.createEmbeddedDocuments("ActiveEffect", [
        {
            _id: foundry.utils.randomID(),
            name: localize(CONFIG.SR3E.INVENTORY.garagejackedin),
            img: actor.img ?? "systems/sr3e/textures/svgrepo/controller-1-svgrepo-com.svg",
            changes: [
                { key: "system.attributes.reaction.mod", type: "add", value: "2", priority: 20 },
                { key: "system.attributes.initiative.mod", type: "add", value: String(vcrLevel), priority: 20 },
            ],
            duration: {},
            disabled: false,
            transfer: true,
            flags: { sr3e: { [RIGGER_BONUS_FLAG]: true } },
        },
    ], { render: false });
}
