import { configkeys, flags } from "../../../types/configuration-keys";
import { localize } from "../utilities";

type MagicSystem = {
	awakened?: { archetype?: string };
	magicianData?: { canAstrallyProject?: boolean };
};

export function actorMagicItems(actor: Actor): Item[] {
	return [...((actor as any).items ?? [])].filter((item: Item) => item.type === "magic");
}

export function isMagicItem(item: Item | null): boolean {
	return item?.type === "magic";
}

export function isMagicianMagic(item: Item | null): boolean {
	return (item?.system as MagicSystem | undefined)?.awakened?.archetype === "magician";
}

export function canAstrallyProject(item: Item | null): boolean {
	return isMagicianMagic(item) &&
		Boolean((item?.system as MagicSystem | undefined)?.magicianData?.canAstrallyProject);
}

export function magicRatingFromCurrentStats(actor: Actor): number {
	const attributes = (actor.system as Record<string, any>)?.attributes ?? {};
	const essence = attributes.essence ?? {};
	const currentEssence = Number(essence.value ?? 6) + Number(essence.mod ?? 0);
	return Math.max(0, Math.min(6, Math.floor(currentEssence)));
}

export async function confirmAwakening(actor: Actor, magicItem: Item): Promise<boolean> {
	return Boolean(await foundry.applications.api.DialogV2.confirm({
		window: { title: localize(CONFIG.SR3E.MODAL.awakencharactertitle) },
		content: `<p>${localize(CONFIG.SR3E.MODAL.awakencharacter).replace("{name}", actor.name ?? "").replace("{magic}", magicItem.name ?? "")}</p>`,
		yes: { label: localize(CONFIG.SR3E.MODAL.confirm), default: true },
		no: { label: localize(CONFIG.SR3E.MODAL.decline) },
		modal: true,
		rejectClose: false,
	}));
}

export async function awakenActor(actor: Actor): Promise<void> {
	await actor.setFlag(configkeys.sr3e, flags.hasAwakened, true);
	await actor.update({
		"system.attributes.magic.value": magicRatingFromCurrentStats(actor),
	}, { render: false });
	Hooks.callAll("actorSystemRecalculated", actor);
}
