import { localize } from "../utilities";

function metatypeItems(actor: Actor): Item[] {
	return [...((actor as any).items ?? [])].filter((item: Item) => item.type === "metatype");
}

function isHumanMetatype(item: Item | undefined): boolean {
	return item?.name?.trim().toLowerCase() === "human";
}

async function confirmGoblinization(actor: Actor): Promise<boolean> {
	return Boolean(await foundry.applications.api.DialogV2.confirm({
		window: { title: localize(CONFIG.SR3E.MODAL.goblinizecharactertitle) },
		content: `<p>${localize(CONFIG.SR3E.MODAL.goblinizecharacter).replace("{name}", actor.name ?? "")}</p>`,
		yes: { label: localize(CONFIG.SR3E.MODAL.goblinize), default: true },
		no: { label: localize(CONFIG.SR3E.MODAL.cancel) },
		modal: true,
		rejectClose: false,
	}));
}

export function canMutateMetatype(actor: Actor): boolean {
	const [metatype] = metatypeItems(actor);
	return isHumanMetatype(metatype);
}

export async function mutateMetatype(actor: Actor, metatype: Item): Promise<Item[] | undefined> {
	const [current] = metatypeItems(actor);
	if (!current) {
		ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.missingmetatype).replace("{name}", actor.name ?? ""));
		return;
	}

	if (!isHumanMetatype(current)) {
		ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.requireshumanmetatype).replace("{name}", actor.name ?? ""));
		return;
	}

	if (!await confirmGoblinization(actor)) return;

	if (current.id) await actor.deleteEmbeddedDocuments("Item", [current.id]);
	const created = await actor.createEmbeddedDocuments("Item", [metatype.toObject()]);
	if (metatype.img) await actor.update({ img: metatype.img }, { render: false });
	Hooks.callAll("actorSystemRecalculated", actor);
	return created;
}
