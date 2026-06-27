export class KarmaDistributionService {
    private static _instance: KarmaDistributionService;

    static Instance(): KarmaDistributionService {
        if (!KarmaDistributionService._instance) {
            KarmaDistributionService._instance = new KarmaDistributionService();
        }
        return KarmaDistributionService._instance;
    }

    private constructor() {}

    getCharacterActors(): Actor[] {
        const actors = game.actors as Collection<Actor> | undefined;
        if (!actors) return [];
        return [...actors.values()].filter(a => a.type === "character");
    }

    async CommitSelected(actor: Actor): Promise<void> {
        // Only commit if actor is marked ready
        const system = actor.system as {
            karma: {
                readyForCommit: boolean;
                lifetimeKarma: number;
                pendingKarmaReward: number;
                spentKarma: number;
                karmaPoolCeiling: number;
            };
        };

        if (!system.karma.readyForCommit) return;

        const metatypeItem = actor.items.find((i: Item) => i.type === "metatype");
        const metatypeSystem = metatypeItem?.system as { karma?: { factor?: number } } | undefined;
        // 0.05 = standard metahuman rate (1 pool point per 20 karma)
        // Human metatypes should have factor 0.1 (1 pool point per 10 karma)
        const factor: number = metatypeSystem?.karma?.factor ?? 0.05;

        const currentLifetime: number = system.karma.lifetimeKarma;
        const pending: number = system.karma.pendingKarmaReward;
        const spent: number = system.karma.spentKarma;

        const newLifetime = currentLifetime + pending;
        const derivedCeiling = Math.floor(newLifetime * factor);
        const ceilingGain = derivedCeiling - Math.floor(currentLifetime * factor);
        // Preserve burns: stored ceiling may be lower than derived due to permanent burns
        const newStoredCeiling = system.karma.karmaPoolCeiling + ceilingGain;
        // goodKarma uses derived (burn-unaware) ceiling so burns don't inflate goodKarma
        const newGoodKarma = newLifetime - spent - derivedCeiling;
        // Pool refreshes to stored (burn-aware) ceiling + 1 free starting point
        const newPoolValue = 1 + newStoredCeiling;

        await actor.update({
            "system.karma.lifetimeKarma": newLifetime,
            "system.karma.karmaPoolCeiling": newStoredCeiling,
            "system.karma.goodKarma": newGoodKarma,
            "system.karma.karmaPool.value": newPoolValue,
            "system.karma.pendingKarmaReward": 0,
            "system.karma.readyForCommit": false,
        });
    }
}
