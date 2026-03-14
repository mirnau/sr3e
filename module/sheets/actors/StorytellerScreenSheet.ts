import { mount } from "svelte";
import StorytellerScreenApp from "../../ui/actors/StorytellerScreenApp.svelte";
import { SR3EActorBase } from "./SR3EActorBase";

export default class StorytellerScreenSheet extends SR3EActorBase {
	get title() {
		return this.actor.name;
	}

	static get DEFAULT_OPTIONS() {
		return {
			...super.DEFAULT_OPTIONS,
			id: `sr3e-storytellerscreen-sheet-${foundry.utils.randomID()}`,
			classes: ["sr3e", "sheet", "actor", "storytellerscreen", "ActorSheetV2"],
			template: null,
			position: { width: 900, height: "auto" },
			window: {
				resizable: true,
			},
			tag: "form",
			submitOnChange: true,
			closeOnSubmit: false,
		};
	}

	protected _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
		// Clean up existing apps before mounting new ones
		this._unmountAllApps();

		const form = this.form as HTMLFormElement;

		// Mount storyteller screen app
		const app = mount(StorytellerScreenApp, {
			target: windowContent,
			props: {
				actor: this.document as Actor,
			},
		});
		this.apps.push(app);

		this._injectFooter(form);
	}

	_injectFooter(form: HTMLFormElement): void {
		if (form.querySelector(".actor-footer")) return;

		const footer = document.createElement("div");
		footer.classList.add("actor-footer");

		const resizeHandle = form.querySelector(".window-resize-handle");
		if (resizeHandle?.parentNode) {
			resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
		} else {
			form.appendChild(footer);
		}
	}

	protected _tearDown(options: DeepPartial<RenderOptions>): void {
		this._unmountAllApps();
		super._tearDown(options);
	}

	_onSubmit(): boolean {
		return false;
	}

	async _onDrop(event: DragEvent): Promise<boolean> {
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}
