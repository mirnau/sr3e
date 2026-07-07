export const DOSSIER_TAB_FLAG = "dossierTab";

export const dossierTabs = [
	"active",
	"knowledge",
	"language",
	"grimoire",
	"inventory",
	"garage",
	"matrix",
	"augmentations",
	"effects",
	"ratsrace",
] as const;

export type DossierTab = (typeof dossierTabs)[number];

const inventoryItemTypes = new Set([
	"ammunition",
	"weapon",
	"wearable",
	"gadget",
	"vehiclecontrolrig",
	"medical",
	"focus",
]);

export function isDossierTab(tab: unknown): tab is DossierTab {
	return typeof tab === "string" && dossierTabs.includes(tab as DossierTab);
}

export function dossierTabForItem(item: Item): DossierTab | null {
	if (item.type === "skill") return skillTab(item);
	if (item.type === "spell" || item.type === "adeptpower") return "grimoire";
	if (item.type === "transaction") return "ratsrace";
	if (item.type === "cyberdeck" || item.type === "matrixprogram") return "matrix";
	if (item.type === "augmentation") return "augmentations";
	if (inventoryItemTypes.has(item.type)) return "inventory";
	return null;
}

export async function persistDossierTab(actor: Actor, tab: DossierTab): Promise<void> {
	await actor.update({ [`flags.sr3e.${DOSSIER_TAB_FLAG}`]: tab }, { render: false });
}

function skillTab(item: Item): DossierTab {
	const skillType = String((item.system as Record<string, unknown>)?.skillType ?? "active");
	if (skillType === "knowledge" || skillType === "language") return skillType;
	return "active";
}
