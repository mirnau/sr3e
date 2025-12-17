/**
 * Foundry ApplicationV2 wrapper for character creation dialog.
 * Manages Svelte component mounting and lifecycle.
 */

import { mount, unmount } from "svelte";
import type SR3EActor from "../../documents/SR3EActor";
import CharacterCreationDialog from "../../ui/dialogs/CharacterCreationDialog.svelte";

/**
 * Character creation application wrapper.
 * Extends Foundry's ApplicationV2 to provide Svelte integration.
 */
export class CharacterCreationApp extends foundry.applications.api.ApplicationV2 {
	#actor: SR3EActor;
	#onSubmit: ((result: boolean) => void) | null;
	#onCancel: (() => void) | null;
	#svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration
	#wasSubmitted = false;

	constructor(actor: SR3EActor, options: { onSubmit?: (result: boolean) => void; onCancel?: () => void } = {}) {
		const mergedOptions = foundry.utils.mergeObject(
			{
				onSubmit: null,
				onCancel: null,
			},
			options
		);

		super(mergedOptions);
		this.#actor = actor;
		this.#onSubmit = mergedOptions.onSubmit ?? null;
		this.#onCancel = mergedOptions.onCancel ?? null;
	}

	static override DEFAULT_OPTIONS = {
		id: "sr3e-character-creation",
		classes: ["sr3e", "sheet", "staticlayout", "charactercreation"],
		tag: "form",
		window: {
			title: "Character Creation",
			resizable: false,
		},
		position: {
			width: "auto",
			height: "auto",
		},
	};

	/**
	 * Returns empty string - Svelte handles rendering
	 */
	override async _renderHTML(_context: unknown, _options: DeepPartial<RenderOptions>): Promise<unknown> {
		return "";
	}

	/**
	 * Mounts the Svelte component into the window content element.
	 * @param _result - Unused render result
	 * @param windowContent - The Foundry window content element to mount into
	 * @param _options - Render options
	 */
	override _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
		if (this.#svelteApp) {
			unmount(this.#svelteApp);
		}

		this.#svelteApp = mount(CharacterCreationDialog, {
			target: windowContent,
			props: {
				actor: this.#actor,
				config: CONFIG.SR3E,
				onSubmit: (result: boolean) => {
					this.#wasSubmitted = true;
					this.#onSubmit?.(result);
					this.close();
				},
				onCancel: () => {
					this.#onCancel?.();
					this.close();
				},
			},
		});
	}

	/**
	 * Cleanup Svelte component on close.
	 * Calls onCancel if dialog was closed without submitting.
	 */
	override async close(options = {}): Promise<this> {
		if (this.#svelteApp) {
			unmount(this.#svelteApp);
			this.#svelteApp = null;
		}

		if (!this.#wasSubmitted) {
			this.#onCancel?.();
		}

		return super.close(options);
	}
}
