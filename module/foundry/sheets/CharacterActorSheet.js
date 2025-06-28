import CharacterSheetApp from "../../svelte/apps/CharacterSheetApp.svelte";
import NeonName from "../../svelte/apps/injections/NeonName.svelte";
import NewsFeed from "../../svelte/apps/injections/NewsFeed.svelte";
import CharacterCreationManager from "../../svelte/apps/injections/charactercreation/CharacterCreationManager.svelte";
import ShoppingCart from "../../svelte/apps/injections/ShoppingCart.svelte";
import SR3DLog from "../../../Log.js";
import { mount, unmount } from "svelte";
import ActorDataService from "../../services/ActorDataService.js";
import { flags } from "../../services/commonConsts.js";
import { StoreManager } from "../../svelte/svelteHelpers/StoreManager.svelte";

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
            resizable: true,
         },
         tag: "form",
         submitOnChange: true,
         closeOnSubmit: false,
      };
   }

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, windowContent) {
      if (this.#app) {
         unmount(this.#app);
         this.#app = null;
      }
      if (this.#neon) {
         unmount(this.#neon);
         this.#neon = null;
      }
      if (this.#feed) {
         unmount(this.#feed);
         this.#feed = null;
      }
      if (this.#cart) {
         unmount(this.#cart);
         this.#cart = null;
      }
      if (this.#creation) {
         unmount(this.#creation);
         this.#creation = null;
      }

      windowContent.innerHTML = "";
      const form = windowContent.parentNode;

      this.#app = mount(CharacterSheetApp, {
         target: windowContent,
         props: {
            actor: this.document,
            config: CONFIG.sr3e,
            form: form,
         },
      });

      const header = form.querySelector("header.window-header");

      this._injectNeonName(header);

      this._injectShoppingCart(header);

      this._injectNewsFeed(form, header);

      let isCharacterCreation = this.document.getFlag(flags.sr3e, flags.actor.isCharacterCreation);
      if (isCharacterCreation) {
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

         this.#creation = mount(CharacterCreationManager, {
            target: anchor,
            props: {
               actor: this.document,
               config: CONFIG.sr3e,
            },
         });
      }
   }

   _injectNeonName(header) {
      let neonSlot = header?.previousElementSibling;

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
            config: CONFIG.sr3e,
         },
      });
   }

   _injectNewsFeed(form, header) {
      const title = form.querySelector(".window-title");
      if (title) {
         title.remove();
      }
      const newsfeedInjection = document.createElement("div");
      header.prepend(newsfeedInjection);

      this.#feed = mount(NewsFeed, {
         target: header,
         anchor: header.firstChild,
         props: {
            actor: this.document,
         },
      });
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
      const data = await foundry.applications.ux.TextEditor.getDragEventData(event);

      if (data.type !== "Item") return super._onDrop(event);

      const droppedItem = await Item.implementation.fromDropData(data);

      if (droppedItem.type === "skill") {
         this.handleSkill(droppedItem);
         return;
      }

      if (droppedItem.type === "metatype") {
         this.handlemetatype(droppedItem);
         return super._onDrop(event);
      }

      return super._onDrop(event);
   }

   async handleSkill(droppedItem) {

      let storeManager = StoreManager.Subscribe(this.document);

      const skillType = droppedItem.system.skillType;
      const itemData = droppedItem.toObject();

      if (skillType === "active" && !droppedItem.system.activeSkill?.linkedAttribute) {
         ui.notifications.warn("Cannot drop an active skill without a linked attribute.");
         return;
      }

      const storeKeyByType = {
         active: stores.activeSkillsIds,
         knowledge: stores.knowledgeSkillsIds,
         language: stores.languageSkillsIds,
      };

      const storeKey = storeKeyByType[skillType];
      if (!storeKey) {
         console.warn("Unsupported skillType dropped:", skillType);
         return;
      }

      const created = await this.document.createEmbeddedDocuments("Item", [itemData], {
         render: false,
      });

      const createdItem = created?.[0];
      if (!createdItem) {
         console.warn("Skill creation failed or returned no result.");
         return;
      }

      const targetStore = storeManager.getActorStore(this.document.id, storeKey, []);
      targetStore.update((current) => [...current, createdItem.id]);

      StoreManager.Unsubscribe(this.document);
   }

   async handlemetatype(droppedItem) {
      const result = await this.actor.canAcceptmetatype(droppedItem);

      if (result === "accept") {
         await this.actor.replacemetatype(droppedItem);
      } else if (result === "goblinize") {
         const confirmed = await foundry.applications.api.DialogV2.confirm({
            title: "Goblinization",
            content: `<h1>Goblinize this character?<br>This action is <strong>irreversible</strong>!</h1>`,
            yes: () => true,
            no: () => false,
            defaultYes: false,
         });

         if (confirmed) {
            await this.actor.replacemetatype(droppedItem);
         }
      } else {
         ui.notifications.info("Only one metatype type allowed.");
      }
   }
}
