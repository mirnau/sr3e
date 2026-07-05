export const REGISTER_TAB_FLAG = "registerTab";

export const registerTabs = [
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

export type RegisterTab = (typeof registerTabs)[number];

const inventoryItemTypes = new Set([
	"ammunition",
	"weapon",
	"wearable",
	"gadget",
	"vehiclecontrolrig",
	"medical",
	"focus",
]);

export function isRegisterTab(tab: unknown): tab is RegisterTab {
	return typeof tab === "string" && registerTabs.includes(tab as RegisterTab);
}

export function registerTabForItem(item: Item): RegisterTab | null {
	if (item.type === "skill") return skillTab(item);
	if (item.type === "spell" || item.type === "adeptpower") return "grimoire";
	if (item.type === "transaction") return "ratsrace";
	if (item.type === "cyberdeck" || item.type === "matrixprogram") return "matrix";
	if (item.type === "augmentation") return "augmentations";
	if (inventoryItemTypes.has(item.type)) return "inventory";
	return null;
}

export async function persistRegisterTab(actor: Actor, tab: RegisterTab): Promise<void> {
	await actor.update({ [`flags.sr3e.${REGISTER_TAB_FLAG}`]: tab }, { render: false });
}

function skillTab(item: Item): RegisterTab {
	const skillType = String((item.system as Record<string, unknown>)?.skillType ?? "active");
	if (skillType === "knowledge" || skillType === "language") return skillType;
	return "active";
}
