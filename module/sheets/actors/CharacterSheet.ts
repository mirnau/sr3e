import { mount } from "svelte";
import CharacterSheetApp from "../../ui/actors/CharacterSheetApp.svelte";
import NeonName from "../../ui/injections/NeonName.svelte";
import NewsFeed from "../../ui/injections/NewsFeed.svelte";
import { SR3EActorBase } from "./SR3EActorBase";

export default class CharacterActorSheet extends SR3EActorBase {
    #app?: SvelteApp;
    #neon?: SvelteApp;
    #newsFeed?: SvelteApp;

    get title() {
        return "";
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "actor", "character", "ActorSheetV2"],
            template: null,
            position: { width: 820, height: 820 },
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

        // Mount main character sheet app
        this.#app = mount(CharacterSheetApp, {
            target: windowContent,
            props: {
                actor: this.document as Actor,
                form,
            },
        });
        this.apps.push(this.#app);

        const header = form.querySelector("header.window-header");
        this._injectNeonName(header);
        this._injectNewsFeed(header);
    }

    _injectNeonName(header: Element | null) {
        if (!header?.parentElement) return;

        let neonSlot = header.previousElementSibling;

        if (!neonSlot || !neonSlot.classList.contains("neon-name-position")) {
            neonSlot = document.createElement("div");
            neonSlot.classList.add("neon-name-position");
            header.parentElement.insertBefore(neonSlot, header);
        }

        if (neonSlot.childNodes.length === 0) {
            this.#neon = mount(NeonName, {
                target: neonSlot,
                props: { actor: this.document },
            });
            this.apps.push(this.#neon);
        }
    }

    _injectNewsFeed(header: Element | null) {
        if (!header?.parentElement) return;

        let newsFeedSlot = header.nextElementSibling;

        if (!newsFeedSlot || !newsFeedSlot.classList.contains("news-feed-position")) {
            newsFeedSlot = document.createElement("div");
            newsFeedSlot.classList.add("news-feed-position");
            header.parentElement.insertBefore(newsFeedSlot, header.nextSibling);
        }

        if (newsFeedSlot.childNodes.length === 0) {
            this.#newsFeed = mount(NewsFeed, {
                target: newsFeedSlot,
            });
            this.apps.push(this.#newsFeed);
        }
    }

    protected _tearDown(options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();
        super._tearDown(options);
    }
}