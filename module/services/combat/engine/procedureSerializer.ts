import type SR3EActor from "../../../documents/SR3EActor";
import type SR3EItem from "../../../documents/SR3EItem";
import type { RollState, ContestExport, SerializedProcedure } from "./types";

type ActorRef = { id: string; uuid: string };
type ItemRef = { id: string | null; uuid: string | null };

type DeserializeOpts = {
    resolveActor?: (ref: ActorRef) => Promise<SR3EActor>;
    resolveItem?: (ref: ItemRef, actor: SR3EActor) => Promise<SR3EItem | null>;
};

type Deserialized = {
    kind: string;
    actor: SR3EActor;
    item: SR3EItem | null;
    rollState: RollState;
    exportCtx: ContestExport;
};

async function defaultResolveActor(ref: ActorRef): Promise<SR3EActor> {
    const doc = await fromUuid(ref.uuid).catch(() => null)
        ?? (game.actors?.get(ref.id) ?? null);
    if (!doc) throw new Error(`Cannot resolve actor: ${ref.uuid} / ${ref.id}`);
    return doc as unknown as SR3EActor;
}

async function defaultResolveItem(ref: ItemRef, actor: SR3EActor): Promise<SR3EItem | null> {
    if (!ref.uuid && !ref.id) return null;
    if (ref.uuid) {
        const doc = await fromUuid(ref.uuid).catch(() => null);
        if (doc) return doc as unknown as SR3EItem;
    }
    if (ref.id) {
        return ((actor as unknown as { items?: Map<string, SR3EItem> }).items?.get(ref.id) ?? null);
    }
    return null;
}

export function serializeProcedure(
    kind: string,
    actor: SR3EActor,
    item: SR3EItem | null,
    rollState: RollState,
    exportCtx: ContestExport,
): SerializedProcedure {
    const a = actor as unknown as { id: string; uuid: string };
    const i = item as unknown as { id: string; uuid: string } | null;
    return {
        schema: 2,
        kind,
        actor: { id: a.id, uuid: a.uuid },
        item: i ? { id: i.id, uuid: i.uuid } : { id: null, uuid: null },
        rollState,
        exportCtx,
    };
}

export async function deserializeProcedure(
    json: SerializedProcedure,
    opts: DeserializeOpts = {},
): Promise<Deserialized> {
    const resolveActor = opts.resolveActor ?? defaultResolveActor;
    const resolveItem = opts.resolveItem ?? defaultResolveItem;

    const actor = await resolveActor(json.actor);
    const item = await resolveItem(json.item, actor);

    return { kind: json.kind, actor, item, rollState: json.rollState, exportCtx: json.exportCtx };
}
