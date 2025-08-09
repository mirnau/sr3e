import CharacterSheetApp from "../../svelte/apps/CharacterSheetApp.svelte";
import NeonName from "../../svelte/apps/injections/NeonName.svelte";
import NewsFeed from "../../svelte/apps/injections/NewsFeed.svelte";
import CharacterCreationManager from "../../svelte/apps/injections/charactercreation/CharacterCreationManager.svelte";
import ShoppingCart from "../../svelte/apps/injections/ShoppingCart.svelte";
import SR3DLog from "../../services/Log.js";
import { mount, unmount } from "svelte";
import ActorDataService from "@services/ActorDataService.js";
import { flags } from "@services/commonConsts.js";
import { StoreManager, stores } from "../../svelte/svelteHelpers/StoreManager.svelte";
import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
import OpposeRollService from "@services/OpposeRollService.js";


export default class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
   #app;
   #neon;
   #feed;
   #cart;
   #creation;
   #footer;
   #composer;

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
      if (this.#footer) {
         unmount(this.#footer);
         this.#footer = null;
      }
      if (this.#composer) {
         unmount(this.#composer);
         this.#composer = null;
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

      this._injectFooter(form);

      this._injectRollComposer(header);

      let isCharacterCreation = this.document.getFlag(flags.sr3e, flags.actor.isCharacterCreation);
      if (isCharacterCreation) {
         this._injectCharacterCreationPointsApp(header);
      }

      SR3DLog.success("Svelte mounted", this.constructor.name);
      return windowContent;
   }

   _injectRollComposer(header) {
      if (this.#composer) return;

      let anchor = header?.previousElementSibling;
      if (!anchor?.classList?.contains("composer-position")) {
         anchor = document.createElement("div");
         anchor.classList.add("composer-position");
         header.parentElement.insertBefore(anchor, header);
      }

      this.#composer = mount(RollComposerComponent, {
         target: anchor,
         props: {
            actor: this.document,
            config: CONFIG.sr3e,
            caller: null, // empty initially
         },
      });
   }

   _injectFooter(form) {
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

   _injectCharacterCreationPointsApp(header) {
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
      if (this.#composer) await unmount(this.#composer);
      this.#app = this.#neon = this.#feed = this.#cart = this.#creation = this.#footer = this.#composer = null;
      return super._tearDown();
   }

   setRollComposerData(callerData, options) {
      if (!this.#composer) return;

      const dict = CONFIG?.sr3e?.attributes ?? {};
      let payload = { ...callerData };

      if (payload?.responseMode) {
         const contest = payload.contestId ? OpposeRollService.getContestById(payload.contestId) : null;
         const hint = contest?.defenseHint ?? OpposeRollService.getDefaultDefenseHint(contest?.initiatorRoll);
         if (hint?.type === "attribute") {
            payload.type = "attribute";
            payload.key = hint.key;
            payload.name = game.i18n.localize(`sr3e.attributes.${hint.key}`) || hint.key;
            payload.item = undefined;
            payload.defenseTNMod = Number(hint.tnMod || 0);
            payload.defenseTNLabel = hint.tnLabel || "Weapon difficulty";
         }
      }

      if (payload?.type === "item" && payload?.key && Object.prototype.hasOwnProperty.call(dict, payload.key)) {
         payload = { ...payload, type: "attribute", item: undefined };
      }

      this.#composer.setCallerData(payload, { visible: true });
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

      const tarGetRWStore = storeManager.GetShallowStore(this.document.id, storeKey, []);
      tarGetRWStore.update((current) => [...current, createdItem.id]);

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
