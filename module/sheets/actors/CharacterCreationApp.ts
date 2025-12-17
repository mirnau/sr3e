/**
 * Foundry ApplicationV2 wrapper for character creation dialog.
 * Manages Svelte component mounting and lifecycle.
 * Now works WITHOUT an existing actor - actor is created after dialog submission.
 */

import { mount, unmount } from "svelte";
import CharacterCreationDialog from "../../ui/dialogs/CharacterCreationDialog.svelte";

/**
 * Character creation application wrapper.
 * Extends Foundry's ApplicationV2 to provide Svelte integration.
 */
export class CharacterCreationApp extends foundry.applications.api.ApplicationV2 {
	#actorName: string;
	#onSubmit: ((result: any) => void) | null;
	#onCancel: (() => void) | null;
	#svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration
	#wasSubmitted = false;

	constructor(actorName: string, options: { onSubmit?: (result: any) => void; onCancel?: () => void } = {}) {
		const mergedOptions = foundry.utils.mergeObject(
			{
				onSubmit: null,
				onCancel: null,
			},
			options
		);

		super(mergedOptions);
		this.#actorName = actorName;
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
				actorName: this.#actorName,
				config: CONFIG.SR3E,
				onSubmit: (result: any) => {
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
