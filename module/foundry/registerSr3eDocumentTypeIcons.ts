import { typekeys } from "../../types/configuration-keys";
import { GADGET_TARGET_ICONS } from "../services/gadgets/gadgetIcons";
import { registerDocumentTypeIcon, registerDocumentTypeIconRule } from "./documentTypeIcons";

const svg = (fileName: string): string => `systems/sr3e/textures/svgrepo/${fileName}`;

export function registerSr3eDocumentTypeIcons(): void {
	registerDocumentTypeIcon("Actor", typekeys.gamemasterscreen, svg("map-svgrepo-com.svg"));
	registerDocumentTypeIcon("Actor", typekeys.broadcaster, svg("media-signal-tower-svgrepo-com.svg"));
	registerDocumentTypeIcon("Actor", typekeys.mechanical, svg("vehicle-speedometer-svgrepo-com.svg"));
	registerDocumentTypeIconRule(
		"Actor",
		typekeys.mechanical,
		source => source.system?.category === "drone",
		svg("mechanical-arm-svgrepo-com.svg")
	);
	registerDocumentTypeIcon("Item", typekeys.focus, svg("crystal-cluster-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.medical, svg("syringe-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.wearable, svg("jacket-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.gadget, svg("cogs-f-svgrepo-com.svg"));
	for (const [gadgetType, icon] of Object.entries(GADGET_TARGET_ICONS)) {
		registerDocumentTypeIconRule(
			"Item",
			typekeys.gadget,
			source => source.system?.type === gadgetType,
			icon
		);
	}
	registerDocumentTypeIcon("Item", typekeys.ammunition, svg("bullets-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.spell, svg("book-open-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.magic, svg("pentagram-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.metatype, svg("person-circle-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.skill, svg("action-solid-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.transaction, svg("yen-money-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.weapon, svg("rifle-gun-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.vehiclecontrolrig, svg("plugin-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.cyberdeck, svg("computer-chip-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.matrixprogram, svg("matrix-svgrepo-com.svg"));
	registerDocumentTypeIcon("Item", typekeys.adeptpower, svg("rune-svgrepo-com.svg"));
	registerDocumentTypeIconRule(
		"Item",
		typekeys.skill,
		source => source.system?.skillType === "knowledge",
		svg("lightbulb-power-svgrepo-com.svg")
	);
	registerDocumentTypeIconRule(
		"Item",
		typekeys.skill,
		source => source.system?.skillType === "language",
		svg("language-svgrepo-com.svg")
	);
}
