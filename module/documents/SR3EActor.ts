import { resolveInitiativeFormula } from "../services/effects/matrixInitiativeFormula";

export default class SR3EActor extends Actor {
    async rollInitiative(): Promise<number> {
        const { dice, base } = resolveInitiativeFormula(this as any);
        const roll = await new foundry.dice.Roll(`${dice}d6 + ${base}`).evaluate();
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flavor: `Initiative (${dice}d6 + ${base})`,
            rolls: [roll],
        });
        return roll.total ?? 0;
    }

    static Register() {
        CONFIG.Actor.documentClass = SR3EActor;
    }
}
