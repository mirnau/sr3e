import { get } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";

export class KarmaPoolBurnService {
    static #instance: KarmaPoolBurnService | null = null;

    private constructor() {}

    static Instance(): KarmaPoolBurnService {
        if (!this.#instance) this.#instance = new KarmaPoolBurnService();
        return this.#instance;
    }

    canBurn(actor: Actor): boolean {
        return get(StoreManager.Instance.GetRWStore<number>(actor, "karma.karmaPool.value")) > 0;
    }

    spend(actor: Actor): void {
        const poolStore = StoreManager.Instance.GetRWStore<number>(actor, "karma.karmaPool.value");
        poolStore.set(get(poolStore) - 1);
        void this.#postChat(actor, CONFIG.SR3E.KARMA.spendKarmaPoolChat);
    }

    burn(actor: Actor): void {
        const poolStore = StoreManager.Instance.GetRWStore<number>(actor, "karma.karmaPool.value");
        const ceilingStore = StoreManager.Instance.GetRWStore<number>(actor, "karma.karmaPoolCeiling");
        poolStore.set(get(poolStore) - 1);
        ceilingStore.set(get(ceilingStore) - 1);
        void this.#postChat(actor, CONFIG.SR3E.KARMA.burnKarmaPoolChat);
    }

    async #postChat(actor: Actor, messageKey: string): Promise<void> {
        const content = game.i18n.format(messageKey, { name: (actor as any).name ?? "" });
        const speaker = (ChatMessage as any).getSpeaker?.({ actor }) ?? {};
        await (ChatMessage as any).create?.({ content, speaker });
    }
}
