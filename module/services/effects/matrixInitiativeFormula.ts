export type InitiativeFormula = { dice: number; base: number };

type StatField = { value?: number; mod?: number };

type ActorLike = {
    items?: Iterable<{ type: string; system?: Record<string, any> }>;
    system?: {
        attributes?: {
            initiative?: StatField;
            reaction?: StatField;
            intelligence?: StatField;
        };
    };
};

type CyberdeckLike = { system?: { stats?: { responseIncrease?: number } } };

function statTotal(stat: StatField | undefined): number {
    return Number(stat?.value ?? 0) + Number(stat?.mod ?? 0);
}

export function findJackedInCyberdeck(actor: ActorLike): CyberdeckLike | null {
    for (const item of actor.items ?? []) {
        if (item.type === "cyberdeck" && item.system?.jackedIn) return item;
    }
    return null;
}

// SR3 Matrix Initiative fully replaces the decker's meatspace Reaction +
// Initiative while jacked in — it's Intelligence-based (Matrix persona
// reflexes), not an additive bonus layered on top like the VCR rigger's
// jack-in effect (riggerBonusEffect.ts). Formula: [Intelligence + (2 x
// Response Increase)] + [1 + Response Increase]D6.
export function matrixInitiativeFormula(actor: ActorLike, deck: CyberdeckLike): InitiativeFormula {
    const responseIncrease = Number(deck.system?.stats?.responseIncrease ?? 0);
    const intelligence = statTotal(actor.system?.attributes?.intelligence);
    return {
        dice: 1 + responseIncrease,
        base: intelligence + responseIncrease * 2,
    };
}

export function standardInitiativeFormula(actor: ActorLike): InitiativeFormula {
    return {
        dice: Math.max(1, statTotal(actor.system?.attributes?.initiative)),
        base: statTotal(actor.system?.attributes?.reaction),
    };
}

export function resolveInitiativeFormula(actor: ActorLike): InitiativeFormula {
    const deck = findJackedInCyberdeck(actor);
    return deck ? matrixInitiativeFormula(actor, deck) : standardInitiativeFormula(actor);
}
