import { mount, unmount } from "svelte";
import CharacterSheetApp from "../../ui/actors/CharacterSheetApp.svelte";
import NeonName from "../../ui/injections/NeonName.svelte";
import NewsFeed from "../../ui/injections/NewsFeed.svelte";
import ShoppingCart from "../../ui/actors/injections/ShoppingCart.svelte";
import CharacterCreationManager from "../../ui/actors/injections/CharacterCreationManager.svelte";
import RollComposerComponent from "../../ui/combat/RollComposerComponent.svelte";
import { SR3EActorBase } from "./SR3EActorBase";
import { KarmaSpendingService } from "../../services/karma/KarmaSpendingService";
import { persistRegisterTab, registerTabForItem } from "../../ui/actors/actor-components/registerTabs";
import { actorMagicItems, awakenActor, confirmAwakening, isMagicItem } from "../../services/magic/awakenActor";
import { mutateMetatype } from "../../services/metatype/mutateMetatype";
import { commodityPrice, hasCommodityComponent, hasCommodityProfile } from "../../services/economy/purchase";
import { initiatePurchase } from "../../services/economy/purchaseOfferFlow";
import { getAdeptMagicItem, spendPowerPoints } from "../../services/magic/adeptPowerPoints";
import { localize } from "../../services/utilities";

export default class CharacterActorSheet extends SR3EActorBase {
    #app?: SvelteApp;
    #neon?: SvelteApp;
    #newsFeed?: SvelteApp;
    #shoppingCart?: SvelteApp;
    #creationManager?: SvelteApp;
    #composer?: SvelteApp;

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
        if (this.#app) return;

        const form = this.form as HTMLFormElement;

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
        this._injectRollComposer(form, header);
        this._injectCreationManager(windowContent);
    }

    _injectNeonName(header: Element | null) {
        if (!header?.parentElement) return;

        let neonSlot = header.parentElement.querySelector(".neon-name-position");

        if (!neonSlot) {
            neonSlot = document.createElement("div");
            neonSlot.classList.add("neon-name-position");
            header.parentElement.insertBefore(neonSlot, header);
        }

        if (neonSlot.childNodes.length === 0) {
            this.#neon = mount(NeonName, {
                target: neonSlot,
                props: { actor: this.document },
            });
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
        }
    }

    _injectRollComposer(form: HTMLFormElement, header: Element | null): void {
        if (!header?.parentElement) return;

        let slot = form.querySelector(".roll-composer-position") as HTMLElement | null;

        if (!slot) {
            slot = document.createElement("div");
            slot.classList.add("roll-composer-position");
            header.parentElement.insertBefore(slot, header);
        }

        if (slot.childNodes.length === 0) {
            const actor = this.document as Actor;
            this.#composer = mount(RollComposerComponent, {
                target: slot,
                props: { actor, actorId: actor.id! },
            });
        }
    }

    _injectCreationManager(_content: Element | null) {
        const header = this.element.querySelector("header.window-header");
        if (!header?.parentElement) return;

        let creationManagerSlot = header.parentElement.querySelector(".points-position");

        if (!creationManagerSlot) {
            creationManagerSlot = document.createElement("div");
            creationManagerSlot.classList.add("points-position");
            header.parentElement.insertBefore(creationManagerSlot, header);
        }

        if (creationManagerSlot.childNodes.length === 0) {
            this.#creationManager = mount(CharacterCreationManager, {
                target: creationManagerSlot,
                props: { actor: this.document as Actor },
            });
        }
    }

    protected async _onDropItem(event: DragEvent, data: Record<string, unknown>): Promise<unknown> {
        const item = await (Item as any).fromDropData(data) as Item | null;
        const actor = this.document as Actor;
        if (item?.type === "metatype") {
            return mutateMetatype(actor, item);
        }

        if (isMagicItem(item)) {
            if (actorMagicItems(actor).length > 0) {
                ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.existingmagic).replace("{name}", actor.name ?? ""));
                return;
            }
            if (!await confirmAwakening(actor, item)) return;

            const created = await actor.createEmbeddedDocuments("Item", [item.toObject()]);
            await awakenActor(actor);
            await persistRegisterTab(actor, "grimoire");
            return created;
        }

        if (item?.type === "spell" && getAdeptMagicItem(actor as any)) {
            ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.adeptscannotlearnspells));
            return;
        }

        if (item?.type === "adeptpower") {
            if (!getAdeptMagicItem(actor as any)) {
                ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.notanadept));
                return;
            }
            const cost = Number((item.system as any)?.powerPointCost ?? 0);
            const spent = await spendPowerPoints(actor as any, cost);
            if (!spent) {
                ui.notifications?.warn(localize(CONFIG.SR3E.MODAL.insufficientpowerpoints));
                return;
            }
            await persistRegisterTab(actor, "grimoire");
            // @ts-expect-error — Foundry v13 _onDropItem signature not fully typed
            return super._onDropItem(event, data);
        }

        if (item?.type === "skill") {
            if (actor.items.getName(item.name!)) {
                ui.notifications?.warn(`"${item.name}" is already on this sheet.`);
                return;
            }
        }

        const seller = item?.parent instanceof Actor && item.parent.id !== actor.id
            ? item.parent as Actor
            : undefined;

        if (hasCommodityProfile(item as any) || (seller && hasCommodityComponent(item as any))) {
            await initiatePurchase(seller, actor, item as Item, commodityPrice(item as any));
            return;
        }

        if (item) {
            const tab = registerTabForItem(item);
            if (tab) await persistRegisterTab(actor, tab);
        }
        // @ts-expect-error — Foundry v13 _onDropItem signature not fully typed
        return super._onDropItem(event, data);
    }

    protected _tearDown(options: DeepPartial<RenderOptions>): void {
        KarmaSpendingService.Instance().cancelAttrSession(this.document as Actor);
        this._unmountAllApps();
        this.#app = undefined;
        if (this.#neon) { unmount(this.#neon); this.#neon = undefined; }
        if (this.#newsFeed) { unmount(this.#newsFeed); this.#newsFeed = undefined; }
        if (this.#shoppingCart) { unmount(this.#shoppingCart); this.#shoppingCart = undefined; }
        if (this.#composer) { unmount(this.#composer); this.#composer = undefined; }
        if (this.#creationManager) { unmount(this.#creationManager); this.#creationManager = undefined; }
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
