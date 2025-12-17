/**
 * Hook handler for createActor - displays character creation dialog for new character actors.
 * Intercepts character creation, shows the creation dialog, and deletes the actor if canceled.
 */

import { CharacterCreationApp } from "../../sheets/actors/CharacterCreationApp";
import type SR3EActor from "../../documents/SR3EActor";

/**
 * Set of actor IDs currently in character creation mode.
 * Sheets for these actors will not render until creation is complete.
 */
const actorsInCreation = new Set<string>();

/**
 * Check if an actor is currently in character creation mode.
 */
export function isActorInCreation(actorId: string): boolean {
	return actorsInCreation.has(actorId);
}

export async function displayCharacterCreationDialog(
	actor: SR3EActor,
	_options: object,
	userId: string
): Promise<boolean> {
	console.log("SR3E | createActor hook fired", { actorType: (actor as any).type, userId });

	// Only show dialog for character actors created by the current user
	if ((actor as any).type !== "character") {
		console.log("SR3E | Not a character actor, skipping dialog");
		return true;
	}
	if (!game.users.get(userId)?.isSelf) {
		console.log("SR3E | Not current user, skipping dialog");
		return true;
	}

	// Mark actor as being in creation mode
	actorsInCreation.add((actor as any).id);
	console.log("SR3E | Actor marked as in creation", (actor as any).id);

	console.log("SR3E | Showing character creation dialog");
	const dialogResult = await runCharacterCreationDialog(actor);

	// Remove from creation tracking
	actorsInCreation.delete((actor as any).id);
	console.log("SR3E | Actor removed from creation tracking", (actor as any).id);

	if (!dialogResult) {
		// User canceled - delete the actor and prevent creation
		console.log("SR3E | User canceled, deleting actor");
		await actor.delete();
		return false;
	}

	// Success - open the character sheet
	console.log("SR3E | Character creation successful, rendering sheet");
	(actor as any).sheet?.render(true);
	return true;
}

async function runCharacterCreationDialog(actor: SR3EActor): Promise<boolean> {
	return new Promise((resolve) => {
		const app = new CharacterCreationApp(actor, {
			onSubmit: (result: boolean) => {
				resolve(result);
			},
			onCancel: () => {
				resolve(false);
			},
		});

		app.render(true);
	});
}
