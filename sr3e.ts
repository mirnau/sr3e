// @ts-nocheck

// sr3e.ts (entry point)

function debugFlagsOnActor(actor: any): void {
   const actorFlags = actor.flags?.[flags.sr3e];
   if (!actorFlags) {
      DEBUG && LOG.warn("No sr3e flags found on actor", [__FILE__, __LINE__], actor);
      return;
   }
   DEBUG && LOG.inspect(`Flags for actor "${actor.name}"`, [__FILE__, __LINE__], actorFlags);
}

function enableDebugHooks(): void {
   debugActorPoolUpdates();
   debugAECreate();
}

function initializeSystem(): void {
   configureProject();
   configureThemes();
   configureQueries();
   registerDocumentTypes({
      args: [
         {
            docClass: Actor,
            type: "character",
            model: CharacterModel,
            sheet: CharacterActorSheet,
         },
         {
            docClass: Actor,
            type: "storytellerscreen",
            model: StorytellerScreenModel,
            sheet: StorytellerScreenActorSheet,
         },
         {
            docClass: Actor,
            type: "mechanical",
            model: MechanicalModel,
            sheet: MechanicalActorSheet,
         },
         {
            docClass: Actor,
            type: "broadcaster",
            model: BroadcasterModel,
            sheet: BroadcasterActorSheet,
         },
         {
            docClass: Item,
            type: "metatype",
            model: MetatypeModel,
            sheet: MetatypeItemSheet,
         },
         {
            docClass: Item,
            type: "magic",
            model: MagicModel,
            sheet: MagicItemSheet,
         },
         {
            docClass: Item,
            type: "weapon",
            model: WeaponModel,
            sheet: WeaponItemSheet,
         },
         {
            docClass: Item,
            type: "ammunition",
            model: AmmunitionModel,
            sheet: AmmunitionItemSheet,
         },
         {
            docClass: Item,
            type: "skill",
            model: SkillModel,
            sheet: SkillItemSheet,
         },
         {
            docClass: Item,
            type: "transaction",
            model: TransactionModel,
            sheet: TransactionItemSheet,
         },
         {
            docClass: Item,
            type: "gadget",
            model: GadgetModel,
            sheet: GadgetItemSheet,
         },
         {
            docClass: Item,
            type: "focus",
            model: FocusModel,
            sheet: FocusItemSheet,
         },
         {
            docClass: Item,
            type: "techinterface",
            model: TechInterfaceModel,
            sheet: TechInterfaceItemSheet,
         },
         {
            docClass: Item,
            type: "spell",
            model: SpellModel,
            sheet: SpellItemSheet,
         },
         {
            docClass: Item,
            type: "wearable",
            model: WearableModel,
            sheet: WearableItemSheet,
         },
      ],
   });
}

function chain<T extends any[]>(...fns: Array<((...args: T) => void) | undefined>) {
   return (...args: T) => {
      for (const fn of fns) fn?.(...args);
   };
}

function registerHooks(): void {
   (Hooks as any).on(
      hooks.renderChatMessageHTML,
      chain(wrapChatMessage, applyAuthorColorToChatMessage, addResistDamageButton, addOpposedResponseButton)
   );

   (Hooks as any).on(hooks.renderApplicationV2, chain(wrapApplicationContent, injectCssSelectors));
   (Hooks as any).on(hooks.preCreateActor, chain(setFlagsOnCharacterPreCreate, stopDefaultCharacterSheetRenderOnCreation));
   (Hooks as any).on(hooks.createActor, chain(debugFlagsOnActor, displayCreationDialog));
   (Hooks as any).on(hooks.ready, initializeNewsService);
   (Hooks as any).on(hooks.dropCanvasData, handleCanvasItemDrop);
   (Hooks as any).on("updateItem", enforceSingleTechinterfaceEquipped);

   if (DEBUG) {
      (Hooks as any).once(hooks.ready, enableDebugHooks);
   }

   // registration map - do this once during init/startup
   AbstractProcedure.registerSubclass("firearm", FirearmProcedure);
   AbstractProcedure.registerSubclass("dodge", DodgeProcedure);
   AbstractProcedure.registerSubclass("resistance", ResistanceProcedure);
   AbstractProcedure.registerSubclass("melee", MeleeProcedure); // attacker
   AbstractProcedure.registerSubclass("melee-defense", MeleeDefenseProcedure); // defender (full)
   AbstractProcedure.registerSubclass("skill", SkillProcedure);
   AbstractProcedure.registerSubclass("skill-response", SkillResponseProcedure);
   AbstractProcedure.registerSubclass("attribute", AttributeProcedure);
   AbstractProcedure.registerSubclass("attribute-response", AttributeResponseProcedure);

   (Hooks as any).once(hooks.init, initializeSystem);

   DEBUG && LOG.success("Initialization Complete", [__FILE__, __LINE__]);
}

registerHooks();
