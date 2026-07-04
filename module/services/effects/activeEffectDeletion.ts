type EffectDeleteSnapshot = {
    actorName: string;
    effectName: string;
    sourceName: string;
    userName: string;
};

type ActiveEffectSource = Item | Actor;

function activeGmIds(): string[] {
    return ((game as any).users ?? [])
        .filter((user: any) => user.isGM && user.active)
        .map((user: any) => user.id);
}

function deletionSnapshot(sourceDocument: ActiveEffectSource, activeEffect: ActiveEffect): EffectDeleteSnapshot {
    const source = sourceDocument as any;
    const actor = source.parent ?? source;
    return {
        actorName: String(actor?.name ?? source.name ?? ""),
        effectName: String((activeEffect as any).name ?? ""),
        sourceName: String(source.name ?? ""),
        userName: String((game as any).user?.name ?? ""),
    };
}

async function whisperActiveEffectDeleted(snapshot: EffectDeleteSnapshot): Promise<void> {
    const whisper = activeGmIds();
    if (whisper.length === 0) return;

    const content = game.i18n.format(CONFIG.SR3E.EFFECTS.deletedChat, snapshot);
    await (ChatMessage as any).create?.({ content, whisper });
}

export async function deleteActiveEffect(sourceDocument: ActiveEffectSource, activeEffect: ActiveEffect): Promise<void> {
    const effectId = String((activeEffect as any).id ?? "");
    if (!effectId) return;

    const snapshot = deletionSnapshot(sourceDocument, activeEffect);
    await (sourceDocument as any).deleteEmbeddedDocuments("ActiveEffect", [effectId], { render: false });
    await whisperActiveEffectDeleted(snapshot);
}
