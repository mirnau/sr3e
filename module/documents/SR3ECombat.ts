import type SR3EActor from "./SR3EActor";

export default class SR3ECombat extends foundry.documents.Combat {
    async startCombat() {
        await this.setFlag("sr3e", "combatTurn", 1);
        await this.setFlag("sr3e", "initiativePass", 1);
        return super.startCombat();
    }

    async rollInitiative(ids: string[], { updateTurn = true } = {}) {
        const updates: { _id: string; initiative: number }[] = [];
        for (const id of ids) {
            const combatant = this.combatants.get(id);
            if (!combatant?.actor) continue;
            const total = await (combatant.actor as unknown as SR3EActor).rollInitiative();
            updates.push({ _id: id, initiative: total });
        }
        if (updates.length > 0) {
            await this.updateEmbeddedDocuments("Combatant", updates);
        }
        if (updateTurn) await this.update({ turn: 0 });
        return this;
    }

    async nextTurn() {
        const result = await super.nextTurn();
        if (this.combatant && (this.combatant.initiative ?? 0) < 1) {
            await this._advanceInitiativePass();
        }
        return result;
    }

    async _advanceInitiativePass() {
        const currentPass = (this.getFlag("sr3e", "initiativePass") as number) || 1;
        for (const c of this.combatants.contents) {
            if ((c.initiative ?? 0) > 0) {
                await c.update({ initiative: Math.max(0, (c.initiative ?? 0) - 10) });
            }
        }
        const stillActive = this.combatants.contents.some(c => (c.initiative ?? 0) > 0);
        if (stillActive) {
            await this.setFlag("sr3e", "initiativePass", currentPass + 1);
            await this.update({ turn: 0 });
        } else {
            await this.nextRound();
        }
    }

    async nextRound() {
        const hasPositive = this.combatants.contents.some(c => (c.initiative ?? 0) > 0);
        if (hasPositive) return this._advanceInitiativePass();

        const round = this.round + 1;
        (game as any).time?.advance(3);
        await this.setFlag("sr3e", "combatTurn", round);
        await this.setFlag("sr3e", "initiativePass", 1);
        await (this as any).resetAll({ updateTurn: false });
        return super.nextRound();
    }

    static Register() {
        (CONFIG as any).Combat.documentClass = SR3ECombat;
    }
}
