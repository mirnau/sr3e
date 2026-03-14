export class KarmaDistributionService {
    private static _instance: KarmaDistributionService;

    static Instance(): KarmaDistributionService {
        if (!KarmaDistributionService._instance) {
            KarmaDistributionService._instance = new KarmaDistributionService();
        }
        return KarmaDistributionService._instance;
    }

    private constructor() {}

    async CommitSelected(actor: Actor): Promise<void> {
        // Only commit if actor is marked ready
        const system = actor.system as {
            karma: {
                readyForCommit: boolean;
                lifetimeKarma: number;
                pendingKarmaReward: number;
                spentKarma: number;
            };
        };

        if (!system.karma.readyForCommit) return;

        const metatypeItem = actor.items.find((i: Item) => i.type === "metatype");
        const metatypeSystem = metatypeItem?.system as { karma?: { factor?: number } } | undefined;
        const factor: number = metatypeSystem?.karma?.factor ?? 0;

        const currentLifetime: number = system.karma.lifetimeKarma;
        const pending: number = system.karma.pendingKarmaReward;
        const spent: number = system.karma.spentKarma;

        const newLifetime = currentLifetime + pending;
        const newCeiling = Math.floor(newLifetime * factor);
        const newGoodKarma = newLifetime - spent - newCeiling;

        await (actor as any).update({
            "system.karma.lifetimeKarma": newLifetime,
            "system.karma.karmaPoolCeiling": newCeiling,
            "system.karma.goodKarma": newGoodKarma,
            "system.karma.pendingKarmaReward": 0,
            "system.karma.readyForCommit": false,
        });
    }
}
