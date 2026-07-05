import { hooks } from "../../types/configuration-keys";

export type EssenceCostItem = {
	id?: string;
	uuid?: string;
	type?: string;
	img?: string;
	parent?: unknown;
	system?: { essenceCost?: number };
	effects: { contents: { flags?: { sr3e?: Record<string, unknown> } }[] };
	createEmbeddedDocuments: (documentName: string, data: Record<string, unknown>[], options?: Record<string, unknown>) => Promise<unknown>;
};

// Shared by every "installed hardware costs Essence" item type (VCR,
// cyberdeck, ...): bakes a permanent -essenceCost ActiveEffect onto the
// owning character the moment the item is actually embedded on one — not
// gated on any jacked-in/seated toggle, since Essence cost represents
// surgically installed cyberware, paid once at installation.
export function registerItemEssenceEffectHook(
	itemType: string,
	flagKey: string,
	labelToken: string,
	fallbackImg: string,
): void {
	const inFlight = new Set<string>();

	Hooks.on(hooks.createItem, async (document: EssenceCostItem, options: { temporary?: boolean }, userId: string) => {
		if (document.type !== itemType) return;
		// A bare item created in the sidebar has no parent actor yet — its
		// essenceCost is still at its schema default at that instant, since the
		// user hasn't had a chance to configure it. Only bake the effect in once
		// the item is actually embedded on an actor (dropped onto a character),
		// by which point it's been configured.
		if (!(document.parent instanceof Actor)) return;
		// createItem fires on every connected client, plus once for the
		// client-side predicted document before server confirmation — only the
		// initiating client, on the confirmed document, should apply the side
		// effect. inFlight closes the same-client async race between the
		// existing-effect check and the (awaited) write.
		if (options?.temporary) return;
		if ((game.user as any)?.id !== userId) return;
		if (document.effects.contents.some((e) => e.flags?.sr3e?.[flagKey])) return;

		const key = document.uuid ?? document.id ?? "unknown";
		if (inFlight.has(key)) return;
		inFlight.add(key);

		const essenceCost = Number(document.system?.essenceCost ?? 0);

		await document.createEmbeddedDocuments("ActiveEffect", [
			{
				// A pre-assigned _id lets Foundry's client-side prediction
				// reconcile the optimistic and server-confirmed copies of this
				// document into one — without it, both survive and the item ends
				// up with two effects from a single creation call.
				_id: foundry.utils.randomID(),
				name: localize(labelToken),
				img: document.img ?? fallbackImg,
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
				flags: { sr3e: { target: "character", [flagKey]: true } },
			},
		], { render: false });
	});
}
