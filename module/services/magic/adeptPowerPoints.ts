const GOOD_KARMA_PER_POWER_POINT = 20;

type MagicSystem = { awakened?: { archetype?: string }; adeptData?: { powerPoints?: number } };
type MagicItemLike = Item & { system: MagicSystem };
type ActorLike = Actor & { system: { karma?: { goodKarma?: number } } };

export function getAdeptMagicItem(actor: ActorLike): MagicItemLike | null {
	const items = [...((actor.items as any) ?? [])] as Item[];
	const found = items.find(
		(item) => item.type === "magic" && (item.system as MagicSystem)?.awakened?.archetype === "adept",
	);
	return (found as MagicItemLike) ?? null;
}

export function getPowerPointsAvailable(actor: ActorLike): number {
	return Number(getAdeptMagicItem(actor)?.system.adeptData?.powerPoints ?? 0);
}

export async function spendPowerPoints(actor: ActorLike, cost: number): Promise<boolean> {
	const magicItem = getAdeptMagicItem(actor);
	if (!magicItem) return false;
	const available = Number(magicItem.system.adeptData?.powerPoints ?? 0);
	if (cost > available) return false;
	await magicItem.update({ "system.adeptData.powerPoints": available - cost }, { render: false });
	return true;
}

export async function buyPowerPoints(actor: ActorLike, quantity: number): Promise<boolean> {
	const magicItem = getAdeptMagicItem(actor);
	if (!magicItem || quantity <= 0) return false;
	const cost = quantity * GOOD_KARMA_PER_POWER_POINT;
	const goodKarma = Number(actor.system.karma?.goodKarma ?? 0);
	if (cost > goodKarma) return false;

	await actor.update({ "system.karma.goodKarma": goodKarma - cost }, { render: false });
	const available = Number(magicItem.system.adeptData?.powerPoints ?? 0);
	await magicItem.update({ "system.adeptData.powerPoints": available + quantity }, { render: false });
	return true;
}

export { GOOD_KARMA_PER_POWER_POINT };
