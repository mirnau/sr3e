export default class SR3EActor extends Actor {
    async rollInitiative(): Promise<number> {
        const sys = this.system as {
            attributes: {
                initiative: { value: number; mod: number };
                reaction: { value: number; mod: number };
            };
        };
        const dice = Math.max(1, sys.attributes.initiative.value + sys.attributes.initiative.mod);
        const react = sys.attributes.reaction.value + sys.attributes.reaction.mod;
        const roll = await new foundry.dice.Roll(`${dice}d6 + ${react}`).evaluate();
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flavor: `Initiative (${dice}d6 + ${react})`,
            rolls: [roll],
        });
        return roll.total ?? 0;
    }

    static Register() {
        CONFIG.Actor.documentClass = SR3EActor;
    }
}
