/**
 * Hook handler for createActor - intercepts character creation entirely.
 * Shows dialog BEFORE creating the actor, then creates it only on submit.
 */

import { CharacterCreationApp } from "../../sheets/actors/CharacterCreationApp";
import type SR3EActor from "../../documents/SR3EActor";

/**
 * Storage for pending character creation data
 */
interface PendingCreation {
	data: any;
	options: object;
	userId: string;
}

const pendingCreations = new Map<string, PendingCreation>();

/**
 * PreCreateActor hook - intercepts character creation to show dialog FIRST
 */
export function preCreateCharacterActor(
	_actor: SR3EActor,
	data: any,
	options: object,
	userId: string
): boolean {
	console.log("SR3E | preCreateActor hook fired", { actorType: data.type, userId });

	// Only intercept character actors created by current user
	if (data.type !== "character") {
		return true;
	}
	if (!game.users.get(userId)?.isSelf) {
		return true;
	}

	// Check if this is a programmatic creation (has our marker)
	if ((options as any).__sr3eAllowCreation) {
		console.log("SR3E | Allowing programmatic character creation");
		return true;
	}

	// Prevent the actor from being created
	console.log("SR3E | Intercepting character creation - showing dialog first");

	// Store the creation data and show dialog
	const creationId = `creation-${Date.now()}-${Math.random()}`;
	pendingCreations.set(creationId, { data, options, userId });

	// Show dialog asynchronously (don't block the hook)
	setTimeout(() => showCharacterCreationDialog(creationId), 0);

	// Return false to prevent the actor creation
	return false;
}

async function showCharacterCreationDialog(creationId: string): Promise<void> {
	const pending = pendingCreations.get(creationId);
	if (!pending) {
		console.error("SR3E | Pending creation not found", creationId);
		return;
	}

	const { data, options } = pending;

	try {
		const result = await runCharacterCreationDialog(data.name || "New Character");

		if (result) {
			// User submitted - create the actor with initialization
			console.log("SR3E | Creating character with selections", result);

			// Mark this creation as allowed
			const createOptions = { ...options, __sr3eAllowCreation: true };

			// Create the actor
			const [actor] = await Actor.create([data], createOptions) as SR3EActor[];

			if (actor) {
				// Apply character creation initialization
				const creationService = (await import("../../services/character-creation/CharacterCreationService")).CharacterCreationService.Instance();
				await creationService.initializeCharacter(actor, result);

				// Open the character sheet
				(actor as any).sheet?.render(true);
			}
		} else {
			console.log("SR3E | Character creation canceled");
		}
	} finally {
		pendingCreations.delete(creationId);
	}
}

async function runCharacterCreationDialog(actorName: string): Promise<any | null> {
	return new Promise((resolve) => {
		const app = new CharacterCreationApp(actorName, {
			onSubmit: (result: any) => {
				resolve(result);
			},
			onCancel: () => {
				resolve(null);
			},
		});

		app.render(true);
	});
}
