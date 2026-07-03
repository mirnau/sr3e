import { mount } from "svelte";
import GameMasterScreenApp from "../../ui/actors/GameMasterScreenApp.svelte";
import { SR3EActorBase } from "./SR3EActorBase";

export default class GameMasterScreenSheet extends SR3EActorBase {
	get title() {
		this.actor.name = localize(CONFIG.SR3E.GMSCREEN.gamemasterscreen);
		return this.actor.name;
	}

	static get DEFAULT_OPTIONS() {
		return {
			...super.DEFAULT_OPTIONS,
			id: `sr3e-gamemasterscreen-sheet-${foundry.utils.randomID()}`,
			classes: ["sr3e", "sheet", "actor", "gamemasterscreen", "ActorSheetV2"],
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

		const app = mount(GameMasterScreenApp, {
			target: windowContent,
			props: {
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
