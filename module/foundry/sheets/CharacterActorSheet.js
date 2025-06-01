import CharacterSheetApp from "../../svelte/apps/CharacterSheetApp.svelte";
import NeonName from "../../svelte/apps/injections/NeonName.svelte";
import NewsFeed from "../../svelte/apps/injections/NewsFeed.svelte";
import CreationPoints from "../../svelte/apps/injections/CreationPoints.svelte";
import ShoppingCart from "../../svelte/apps/injections/ShoppingCart.svelte";
import SR3DLog from "../../../Log.js";
import { mount, unmount } from 'svelte';
import ActorDataService from "../services/ActorDataService";
import { flags } from "../services/commonConsts";

export default class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  #app;
  #neon;
  #feed;
  #cart;
  #creation;

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "actor", "character", "ActorSheetV2"],
      template: null,
      position: { width: 820, height: 820 },
      window: {
        resizable: true
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }

  _renderHTML() {
    return null;
  }

  _replaceHTML(_, windowContent) {
    windowContent.innerHTML = "";
    const form = windowContent.parentNode;

    this.#app = mount(CharacterSheetApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
        form: form
      }
    });

    const header = form.querySelector("header.window-header");

    this._injectNeonName(header);

    this._injectShoppingCart(header);

    this._injectNewsFeed(form, header);

    const isCharacterCreation = this.document.getFlag(flags.sr3e, flags.actor.isCharacterCreation);
    console.log("IS CHARCTER CREATION", isCharacterCreation);

    if(isCharacterCreation) {
      this._injectCharachterCreationPointsApp(header);
    }

    SR3DLog.success("Svelte mounted", this.constructor.name);
    return windowContent;

  }

    _injectCharachterCreationPointsApp(header) {
    let anchor = header?.previousElementSibling;
    if (!anchor?.classList?.contains("points-position")) {
      anchor = document.createElement("div");
      anchor.classList.add("points-position");
      header.parentElement.insertBefore(anchor, header);

      this.#creation = mount(CreationPoints, {
        target: anchor,
        props: { 
          actor: this.document,
          config: CONFIG.sr3e
         }
      });
    }
  }

  _injectNeonName(header) {
    let neonSlot = header?.previousElementSibling;
    if (!neonSlot?.classList?.contains("neon-name-position")) {
      neonSlot = document.createElement("div");
      neonSlot.classList.add("neon-name-position");
      header.parentElement.insertBefore(neonSlot, header);

      this.#neon = mount(NeonName, {
        target: neonSlot,
        props: { actor: this.document }
      });
    }
  }

  _injectShoppingCart(header) {
    if (this.#cart) return;

    let cartSlot = header.querySelector(".shopping-cart-slot");
    if (!cartSlot) {
      cartSlot = document.createElement("div");
      cartSlot.classList.add("shopping-cart-slot");
      header.insertBefore(cartSlot, header.firstChild);
    }

    this.#cart = mount(ShoppingCart, {
      target: cartSlot,
      props: {
        actor: this.document,
        config: CONFIG.sr3e
      }
    });
  }

  _injectNewsFeed(form, header) {
    const title = form.querySelector(".window-title");
    if (title) {
      title.remove();
      const newsfeedInjection = document.createElement("div");
      header.prepend(newsfeedInjection);

      this.#feed = mount(NewsFeed, {
        target: header,
        anchor: header.firstChild,
        props: {
          actor: this.document
        }
      });
    }
  }

  async _tearDown() {
    if (this.#neon) await unmount(this.#neon);
    if (this.#app) await unmount(this.#app);
    if (this.#feed) await unmount(this.#feed);
    if (this.#cart) await unmount(this.#cart);
    if (this.#creation) await unmount(this.#creation);
    this.#app = this.#neon = this.#feed = this.#cart = null;
    return super._tearDown();
  }

  _onSubmit() {
    return false;
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = await TextEditor.getDragEventData(event);

    if (data.type !== "Item") return;

    const droppedItem = await Item.implementation.fromDropData(data);
    if (droppedItem.type !== "metahuman") return;

    const result = await this.actor.canAcceptMetahuman(droppedItem);

    if (result === "accept") {
      await this.actor.replaceMetahuman(droppedItem);
    } else if (result === "goblinize") {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        title: "Goblinization",
        content: `<h1>Goblinize this character?<br>This action is <strong>irreversible</strong>!</h1>`,
        yes: () => true,
        no: () => false,
        defaultYes: false,
      });

      if (confirmed) {
        await this.actor.replaceMetahuman(droppedItem);
      }
    } else {
      ui.notifications.info("Only one metahuman type allowed.");
    }
  }
}
