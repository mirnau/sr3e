import { hooks, typekeys } from "../../types/configuration-keys";

const ESSENCE_EFFECT_FLAG = "vehicleControlRigEssence";
const inFlight = new Set<string>();

type VehicleControlRigItem = {
	id?: string;
	uuid?: string;
	type?: string;
	img?: string;
	parent?: unknown;
	system?: { essenceCost?: number };
	effects: { contents: { flags?: { sr3e?: Record<string, unknown> } }[] };
	createEmbeddedDocuments: (documentName: string, data: Record<string, unknown>[], options?: Record<string, unknown>) => Promise<unknown>;
};

export function registerVehicleControlRigEssenceHook(): void {
	Hooks.on(hooks.createItem, async (document: VehicleControlRigItem, options: { temporary?: boolean }, userId: string) => {
		if (document.type !== typekeys.vehiclecontrolrig) return;
		// A bare item created in the sidebar has no parent actor yet — its
		// essenceCost/level are still at their schema defaults at that instant,
		// since the user hasn't had a chance to configure it. Only bake the
		// effect in once the item is actually embedded on an actor (dropped
		// onto a character), by which point it's been configured.
		if (!(document.parent instanceof Actor)) return;
		// createItem fires on every connected client, plus once for the
		// client-side predicted document before server confirmation — only the
		// initiating client, on the confirmed document, should apply the
		// side effect. inFlight closes the same-client async race between the
		// existing-effect check and the (awaited) write.
		if (options?.temporary) return;
		if ((game.user as any)?.id !== userId) return;
		if (document.effects.contents.some((e) => e.flags?.sr3e?.[ESSENCE_EFFECT_FLAG])) return;

		const key = document.uuid ?? document.id ?? "unknown";
		if (inFlight.has(key)) return;
		inFlight.add(key);

		const essenceCost = Number(document.system?.essenceCost ?? 0);

		await document.createEmbeddedDocuments("ActiveEffect", [
			{
				// A pre-assigned _id lets Foundry's client-side prediction
				// reconcile the optimistic and server-confirmed copies of this
				// document into one — without it, both survive and the item
				// ends up with two effects from a single creation call.
				_id: foundry.utils.randomID(),
				name: localize(CONFIG.SR3E.VEHICLE_CONTROL_RIG.vehiclecontrolrig),
				img: document.img ?? "systems/sr3e/textures/svgrepo/controller-1-svgrepo-com.svg",
				changes: [
					{
						key: "system.attributes.essence.mod",
						type: "add",
						value: String(-essenceCost),
						priority: 20,
					},
				],
				duration: {},
				disabled: false,
				transfer: true,
				flags: { sr3e: { target: "character", [ESSENCE_EFFECT_FLAG]: true } },
			},
		], { render: false });
	});
}
