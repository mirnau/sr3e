type MedicalItem = {
    id: string;
    name: string;
    system: { isReusable?: boolean };
    effects: { contents: ActiveEffect[] };
    parent: Actor | null;
    delete: () => Promise<void>;
};

function gadgetEffects(item: MedicalItem): ActiveEffect[] {
    return item.effects.contents.filter((e: any) => e.flags?.sr3e?.gadget?.type === "gadget");
}

function nativeEffects(item: MedicalItem): ActiveEffect[] {
    return item.effects.contents.filter((e: any) => !e.flags?.sr3e?.gadget?.type);
}

function controllingUserId(actor: Actor): string | undefined {
    return (game as any).users?.find(
        (u: any) => !u.isGM && actor.testUserPermission(u, "OWNER")
    )?.id;
}

async function whisperDepletion(item: MedicalItem): Promise<void> {
    const gmIds: string[] = ((game as any).users ?? [])
        .filter((u: any) => u.isGM && u.active)
        .map((u: any) => u.id);
    const ownerId = controllingUserId(item.parent!);
    const whisper = [...new Set([...gmIds, ...(ownerId ? [ownerId] : [])])];
    const content = game.i18n.format(CONFIG.SR3E.MEDICAL.medicalDepletedChat, { name: item.name });
    await (ChatMessage as any).create?.({ content, whisper });
}

export async function applyMedical(sourceItem: MedicalItem, targetActor: Actor): Promise<void> {
    const native = nativeEffects(sourceItem);
    const gadgets = gadgetEffects(sourceItem);

    if (native.length > 0) {
        const aeData = native.map((e: any) => ({ ...e.toObject(), _id: foundry.utils.randomID() }));
        await (targetActor as any).createEmbeddedDocuments("ActiveEffect", aeData);
    }

    if (sourceItem.system.isReusable) {
        if (gadgets.length > 0) {
            const gadgetData = gadgets.map((e: any) => ({ ...e.toObject(), _id: foundry.utils.randomID() }));
            await (targetActor as any).createEmbeddedDocuments("ActiveEffect", gadgetData);
        }

        const roll = Math.ceil(Math.random() * 6);
        if (roll === 1) {
            const ids = gadgets.map((e: any) => e.id).filter(Boolean);
            if (ids.length > 0) await (sourceItem as any).deleteEmbeddedDocuments("ActiveEffect", ids);
            await whisperDepletion(sourceItem);
        }
    } else {
        await sourceItem.delete();
    }
}

export function registerMedicalTokenDropHook(): void {
    Hooks.on("dropCanvasData", async (_canvas: unknown, data: Record<string, unknown>) => {
        if (data.type !== "Item") return;

        const item = await (Item as any).fromDropData(data) as any;
        if (!item || item.type !== "medical") return;

        const pos = data as { x?: number; y?: number };
        const token = (canvas as any)?.tokens?.placeables?.find((t: any) => {
            const b = t.bounds ?? t.hitArea;
            return b && pos.x !== undefined && pos.y !== undefined &&
                b.contains(pos.x, pos.y);
        });

        if (!token?.actor) return;

        const sourceActor: Actor | null = item.parent instanceof Actor ? item.parent : null;
        if (!sourceActor) return;

        const sourceItem = sourceActor.items.get(item.id) as unknown as MedicalItem | undefined;
        if (!sourceItem) return;

        await applyMedical(sourceItem, token.actor);
        return false;
    });
}
