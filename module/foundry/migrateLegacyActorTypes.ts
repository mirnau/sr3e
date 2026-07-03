import { typekeys } from "../../types/configuration-keys";

const legacyActorTypes = new Map([
	[typekeys.legacyStorytellerScreen, typekeys.gamemasterscreen],
]);

export async function migrateLegacyActorTypes(): Promise<void> {
	const actors = (game.actors?.contents ?? []) as Actor[];
	const updates = actors.flatMap((actor: Actor) => {
		const type = legacyActorTypes.get(actor.type);
		if (!actor.id || !type) return [];
		return [{ _id: actor.id, type }];
	});

	if (!updates.length) return;

	try {
		await Actor.updateDocuments(updates);
		console.log(`SR3E | Migrated ${updates.length} legacy actor type(s).`);
	} catch (error) {
		console.warn("SR3E | Legacy actor type migration failed.", error);
	}
}
