/**
 * Hook handler for createActor - intercepts character creation entirely.
 * Shows dialog BEFORE creating the actor, then creates it only on submit.
 */

import { CharacterCreationApp } from "../../sheets/actors/CharacterCreationApp";
import { CharacterCreationService } from "../../services/character-creation/CharacterCreationService";
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
 * Reference to the native "Create Actor" DialogV2 instance while it's open, so
 * preCreateCharacterActor can force it closed the moment it intercepts creation.
 */
let nativeCreateDialog: { close: (options?: object) => Promise<unknown> } | null = null;
let awaitingNativeCreateDialog = false;

/**
 * Foundry's native "Create Actor" dialog's own "ok" button callback awaits
 * Actor.create() and then calls `document.sheet.render()` on the result. Our
 * preCreateActor hook blocks creation (returns false) so it can show
 * CharacterCreationApp first, which leaves `document` undefined and makes
 * Foundry's callback throw a TypeError. That callback runs inside
 * DialogV2._onSubmit, a bare async click handler nobody awaits, so the throw
 * becomes an unhandled promise rejection rather than something we could catch
 * by wrapping Actor.createDialog itself. We patch DialogV2._onSubmit directly
 * so the exception is caught where it's actually thrown; the actor is still
 * created correctly afterward through showCharacterCreationDialog.
 */
export function patchActorCreateDialog(): void {
	const originalCreateDialog = Actor.createDialog;

	Hooks.on("renderDialogV2", (app: unknown) => {
		if (awaitingNativeCreateDialog) {
			nativeCreateDialog = app as { close: (options?: object) => Promise<unknown> };
		}
	});

	Actor.createDialog = async function (this: unknown, ...args: unknown[]) {
		awaitingNativeCreateDialog = true;
		try {
			return await (originalCreateDialog as (...a: unknown[]) => Promise<unknown>).apply(this, args);
		} finally {
			awaitingNativeCreateDialog = false;
			nativeCreateDialog = null;
		}
	} as typeof Actor.createDialog;

	patchDialogV2SubmitForMissingSheet();
}

/**
 * Wraps DialogV2.prototype._onSubmit so the TypeError thrown by Foundry's
 * native "Create Actor" button callback (when our preCreateActor hook blocks
 * creation and leaves `document` undefined) is swallowed at its actual source
 * instead of leaking as an unhandled promise rejection. Any other error is
 * rethrown unchanged.
 */
function patchDialogV2SubmitForMissingSheet(): void {
	const DialogV2 = (foundry as any).applications.api.DialogV2;
	const originalOnSubmit = DialogV2.prototype._onSubmit;

	DialogV2.prototype._onSubmit = async function (this: unknown, ...args: unknown[]) {
		try {
			return await originalOnSubmit.apply(this, args);
		} catch (error) {
			if (error instanceof TypeError && /sheet/.test(error.message)) {
				return null;
			}
			throw error;
		}
	};
}

/**
 * Force-closes the native "Create Actor" dialog if it's currently open. Called
 * as soon as we intercept character creation so the dialog doesn't linger
 * behind CharacterCreationApp.
 */
function closeNativeCreateDialog(): void {
	nativeCreateDialog?.close({ force: true })?.catch(() => {});
}

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

	// Close Foundry's native "Create Actor" dialog now, rather than leaving it
	// stuck open behind CharacterCreationApp
	closeNativeCreateDialog();

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
		// Ensure default items exist before showing dialog
		const creationService = CharacterCreationService.Instance();
		await creationService.ensureDefaultItemsExist();

		const result = await runCharacterCreationDialog(data.name || "New Character");

		if (result) {
			// User submitted - create the actor with initialization
			console.log("SR3E | Creating character with selections", result);

			// Mark this creation as allowed
			const createOptions = { ...options, __sr3eAllowCreation: true };

			// Create the actor
			const createData = result.img ? { ...data, img: result.img } : data;
			const [actor] = await Actor.create([createData], createOptions) as SR3EActor[];

			if (actor) {
				// Apply character creation initialization
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
