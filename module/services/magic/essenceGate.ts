type EssenceAttribute = { value?: number; mod?: number };
type ActorWithEssence = { system: { attributes?: { essence?: EssenceAttribute } } };

export function currentEssence(actor: ActorWithEssence): number {
	const essence = actor.system.attributes?.essence ?? {};
	return Number(essence.value ?? 6) + Number(essence.mod ?? 0);
}

// Essence reaching zero or below is fatal (SR3 core rule) — anything that
// deducts Essence (cyberware/bioware, cyberdecks, vehicle control rigs) must
// never be allowed to cross that line via a simple drag-and-drop.
export function wouldBeLethal(actor: ActorWithEssence, essenceCost: number): boolean {
	return currentEssence(actor) - essenceCost <= 0;
}
