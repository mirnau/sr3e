import { mount } from "svelte";
import CharacterSheetApp from "../../ui/actors/CharacterSheetApp.svelte";
import NeonName from "../../ui/injections/NeonName.svelte";
import NewsFeed from "../../ui/injections/NewsFeed.svelte";
import ShoppingCart from "../../ui/actors/injections/ShoppingCart.svelte";
import CharacterCreationManager from "../../ui/actors/injections/CharacterCreationManager.svelte";
import { SR3EActorBase } from "./SR3EActorBase";

export default class CharacterActorSheet extends SR3EActorBase {
    #app?: SvelteApp;
    #neon?: SvelteApp;
    #newsFeed?: SvelteApp;
    #shoppingCart?: SvelteApp;
    #creationManager?: SvelteApp;

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
        this._injectShoppingCart(header);

        // Inject creation manager into main content
        this._injectCreationManager(windowContent);
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
        if (!header) return;

        // Find existing news feed slot inside header
        let newsFeedSlot = header.querySelector(".news-feed-position");

        if (!newsFeedSlot) {
            // Create new slot and insert before the first header-control button
            newsFeedSlot = document.createElement("div");
            newsFeedSlot.classList.add("news-feed-position");

            const firstControl = header.querySelector(".header-control");
            if (firstControl) {
                header.insertBefore(newsFeedSlot, firstControl);
            } else {
                header.appendChild(newsFeedSlot);
            }
        }

        if (newsFeedSlot.childNodes.length === 0) {
            this.#newsFeed = mount(NewsFeed, {
                target: newsFeedSlot,
            });
            this.apps.push(this.#newsFeed);
        }
    }

    _injectShoppingCart(header: Element | null) {
        if (!header) return;

        // Shopping cart appears after all other header controls
        let shoppingCartSlot = header.querySelector(".shopping-cart-position");

        if (!shoppingCartSlot) {
            shoppingCartSlot = document.createElement("div");
            shoppingCartSlot.classList.add("shopping-cart-position");
            header.appendChild(shoppingCartSlot);
        }

        if (shoppingCartSlot.childNodes.length === 0) {
            this.#shoppingCart = mount(ShoppingCart, {
                target: shoppingCartSlot,
                props: { actor: this.document as Actor },
            });
            this.apps.push(this.#shoppingCart);
        }
    }

    _injectCreationManager(content: Element | null) {
        if (!content) return;

        const header = this.element.querySelector("header.window-header");
        if (!header?.parentElement) return;

        // Creation manager needs to be positioned relative to header for sidebar positioning
        let creationManagerSlot = header.previousElementSibling;

        if (!creationManagerSlot || !creationManagerSlot.classList.contains("points-position")) {
            creationManagerSlot = document.createElement("div");
            creationManagerSlot.classList.add("points-position");
            header.parentElement.insertBefore(creationManagerSlot, header);
        }

        if (creationManagerSlot.childNodes.length === 0) {
            this.#creationManager = mount(CharacterCreationManager, {
                target: creationManagerSlot,
                props: { actor: this.document as Actor },
            });
            this.apps.push(this.#creationManager);
        }
    }

    protected override async _onDropItem(event: DragEvent, data: Record<string, unknown>): Promise<unknown> {
        const item = await (Item as any).fromDropData(data) as Item | null;
        if (item?.type === "skill") {
            const actor = this.document as Actor;
            if (actor.items.getName(item.name!)) {
                ui.notifications?.warn(`"${item.name}" is already on this sheet.`);
                return;
            }
        }
        // @ts-expect-error — Foundry v13 _onDropItem signature not fully typed
        return super._onDropItem(event, data);
    }

    protected _tearDown(options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();
        super._tearDown(options);
    }

    /**
     * Override _updatePosition to allow the window to be dragged freely
     * without being constrained to the viewport bounds.
     */
    protected _updatePosition(position: foundry.applications.api.ApplicationV2.Position): foundry.applications.api.ApplicationV2.Position {
        // Store the requested position values before parent processing
        const requestedTop = position.top;
        const requestedLeft = position.left;

        // Call parent to handle all normal position processing (scaling, z-index, etc.)
        const processed = super._updatePosition(position);

        // Override the constrained top/left with our unrestricted values
        if (requestedTop !== undefined) processed.top = requestedTop;
        if (requestedLeft !== undefined) processed.left = requestedLeft;

        return processed;
    }
}