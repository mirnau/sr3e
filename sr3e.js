import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { sr3e } from "./module/foundry/config.js";
import { hooks, flags } from "./module/services/commonConsts.js";
import { injectFooterIntoWindowApp } from "./module/foundry/hooks/renderApplicationV2/injectFooterIntoWindowApp.js";
import { localize } from "./module/services/utilities.js";
import injectCssSelectors from "./module/foundry/hooks/renderApplicationV2/injectCssSelectors.js";
import MetahumanModel from "./module/models/item/MetahumanModel.js";
import MetahumanItemSheet from "./module/foundry/sheets/MetahumanItemSheet.js";
import MagicItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MagicModel from "./module/models/item/MagicModel.js";
import WeaponItemSheet from "./module/foundry/sheets/WeaponItemSheet.js";
import WeaponModel from "./module/models/item/WeaponModel.js";
import AmmunitionModel from "./module/models/item/AmmunitionModel.js";
import AmmunitionItemSheet from "./module/foundry/sheets/AmmunitionItemSheet.js";
import SkillItemSheet from "./module/foundry/sheets/SkillItemSheet.js";
import SkillModel from "./module/models/item/SkillModel.js";
import CharacterCreationDialogApp from "./module/svelte/apps/dialogs/CharacterCreationDialogApp.svelte"
import displayCreationDialog from "./module/foundry/hooks/createActor/displayCreationDialogHook.js";
import stopDefaultCharacterSheetRenderOnCreation from "./module/foundry/hooks/preCreateActor/stopDefaultCharacterSheetRenderOnCreation.js";
import SR3EActor from "./module/foundry/documents/SR3EActor.js";
import { attachLightEffect } from "./module/foundry/hooks/renderApplicationV2/attachLightEffect.js";
import StorytellerScreenModel from "./module/models/actor/StorytellerScreenModel.js";
import StorytellerScreenActorSheet from "./module/foundry/sheets/StorytellerScreenActorSheet.js";
import TransactionModel from "./module/models/item/TransactionModel.js";
import TransactionItemSheet from "./module/foundry/sheets/TransactionItemSheet.js";

const { DocumentSheetConfig } = foundry.applications.apps;

function registerDocumentTypes({ args }) {
  args.forEach(({ docClass, type, model, sheet }) => {
    const docName = docClass.documentName;
    CONFIG[docName].dataModels ||= {};
    CONFIG[docName].dataModels[type] = model;
    DocumentSheetConfig.registerSheet(
      docClass,
      flags.sr3e,
      sheet,
      { types: [type], makeDefault: true }
    );
  });
}

function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.Actor.documentClass = SR3EActor;
  CONFIG.canvasTextStyle.fontFamily = "VT323";
  CONFIG.defaultFontFamily = "VT323";
  CONFIG.fontDefinitions["Neanderthaw"] = {
    editor: true,
    fonts: [
      {
        urls: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
        weight: 400,
        style: "normal"
      }
    ]
  };

  CONFIG.fontDefinitions["VT323"] = {
    editor: true,
    fonts: [
      {
        urls: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
        weight: 400,
        style: "normal"
      }
    ]
  };

  CONFIG.Actor.typeLabels = {
    character: localize(CONFIG.sr3e.sheet.playercharacter),
  };
  CONFIG.Item.typeLabels = {
    metahuman: localize(CONFIG.sr3e.traits.metahuman),
    magic: localize(CONFIG.sr3e.magic.magic),
    weapon: localize(CONFIG.sr3e.weapon.weapon),
    ammunition: localize(CONFIG.sr3e.ammunition.ammunition),
    skill: localize(CONFIG.sr3e.skill.skill),
    storytellerscreen: localize(CONFIG.sr3e.storytellerscreen.storytellerscreen),
    transaction: localize(CONFIG.sr3e.transaction.transaction),
  };

  DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
  DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
}

function setupMouseLightSourceEffect(includedThemes) {

  Hooks.on(hooks.renderApplicationV2, (app, html) => {
    const activeTheme = game.settings.get("sr3e", "theme");
    console.log("active theme", activeTheme);
    if (includedThemes.includes(activeTheme)) {
      attachLightEffect(html, activeTheme);
    }
  });
}

function configureThemes() {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: { defaultDark: "Chummer Dark", defaultLight: "Chummer Light" },
    default: "defaultDark"
  });
  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });

  setupMouseLightSourceEffect(["defaultDark", "defaultLight"]);
}

function wrapContent(root) {

  if (!root || root.firstElementChild?.classList.contains("sheet-component")) return;

  const existing = Array.from(root.children);

  const sheetComponent = document.createElement("div");
  sheetComponent.classList.add("sheet-component");

  const innerContainer = document.createElement("div");
  innerContainer.classList.add("sr3e-inner-background-container");

  const fakeShadow = document.createElement("div");
  fakeShadow.classList.add("fake-shadow");

  const innerBackground = document.createElement("div");
  innerBackground.classList.add("sr3e-inner-background");

  // Instead of moving nodes, just rewrap in place
  innerBackground.append(...existing);
  innerContainer.append(fakeShadow, innerBackground);
  sheetComponent.append(innerContainer);

  root.appendChild(sheetComponent);
}

function setFlagsOnCharacterPreCreate(document, data, options, userId) {
  // Define your flags array
  const flagsToSet = [
    { namespace: flags.sr3e, flag: flags.actor.isCharacterCreation, value: true },
    { namespace: flags.sr3e, flag: flags.actor.hasAwakened, value: false },
    { namespace: flags.sr3e, flag: flags.actor.burntOut, value: false },
    { namespace: flags.sr3e, flag: flags.actor.attributeAssignmentLocked, value: false },
    { namespace: flags.sr3e, flag: flags.actor.persistanceBlobCharacterSheetSize, value: {} },
    { namespace: flags.sr3e, flag: flags.actor.isShoppingState, value: true }
  ];

  // Build the update object by looping through the array
  const updateData = {};
  flagsToSet.forEach(({ namespace, flag, value }) => {
    updateData[`flags.${namespace}.${flag}`] = value;
  });

  // Apply all flags at once
  document.updateSource(updateData);
}

function debugFlagsOnActor(actor, options, userId) {
  const actorFlags = actor.flags?.[flags.sr3e];
  if (!actorFlags) return console.warn("No sr3e flags found on actor:", actor);

  console.groupCollapsed(`Flags for actor "${actor.name}"`);
  for (const [key, value] of Object.entries(actorFlags)) {
    console.log(`→ ${key}:`, value);
  }
  console.groupEnd();
}


function registerHooks() {

  Hooks.on(hooks.renderApplicationV2, (app, element) => {
    if (element.firstElementChild?.classList.contains("sheet-component")) return;

    //Note: to find classes, just walk the namespace

    const typeSelectors = [
      { type: foundry.applications.api.DialogV2 },
      { type: foundry.applications.api.CategoryBrowser },
      { type: foundry.applications.api.DocumentSheetV2 },
      { type: foundry.applications.api.CategoryBrowser },
      { type: foundry.applications.sheets.journal.JournalEntryPageSheet },
      { type: foundry.applications.sheets.ActiveEffectConfig },
      { type: foundry.applications.sheets.AdventureImporterV2 },
      { type: foundry.applications.sheets.AmbientLightConfig },
      { type: foundry.applications.sheets.AmbientSoundConfig },
      { type: foundry.applications.sheets.CardConfig },
      { type: foundry.applications.sheets.CardDeckConfig },
      { type: foundry.applications.sheets.CardHandConfig },
      { type: foundry.applications.sheets.CardPileConfig },
      { type: foundry.applications.sheets.CardsConfig },
      { type: foundry.applications.sheets.CombatantConfig },
      { type: foundry.applications.sheets.DrawingConfig },
      { type: foundry.applications.sheets.FolderConfig },
      { type: foundry.applications.sheets.MacroConfig },
      { type: foundry.applications.sheets.MeasuredTemplateConfig },
      { type: foundry.applications.sheets.NoteConfig },
      { type: foundry.applications.sheets.PlaylistConfig },
      { type: foundry.applications.sheets.PlaylistSoundConfig },
      { type: foundry.applications.sheets.PrototypeTokenConfig },
      { type: foundry.applications.sheets.RegionBehaviorConfig },
      { type: foundry.applications.sheets.RegionConfig },
      { type: foundry.applications.sheets.RollTableSheet },
      { type: foundry.applications.sheets.SceneConfig },
      { type: foundry.applications.sheets.TableResultConfig },
      { type: foundry.applications.sheets.TileConfig },
      { type: foundry.applications.sheets.TokenConfig },
      { type: foundry.applications.sheets.UserConfig },
      { type: foundry.applications.sheets.WallConfig },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.apps.FilePicker },
      { type: foundry.applications.apps.PermissionConfig },
      { type: foundry.applications.apps.ImagePopout },
      { type: foundry.applications.apps.DocumentOwnershipConfig },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.apps.CompendiumArtConfig },
      { type: foundry.applications.apps.DocumentSheetConfig },
      { type: foundry.applications.apps.GridConfig },
      { type: foundry.applications.apps.av.CameraPopout },
      { type: foundry.applications.apps.av.CameraViews },
      { type: foundry.applications.sidebar.apps.ControlsConfig },
      { type: foundry.applications.sidebar.apps.ModuleManagement },
      { type: foundry.applications.sidebar.apps.WorldConfig },
      { type: foundry.applications.sidebar.apps.ToursManagement },
      { type: foundry.applications.sidebar.apps.SupportDetails },
      { type: foundry.applications.sidebar.apps.InvitationLinks },
      { type: foundry.applications.sidebar.apps.FolderExport },
      { type: foundry.applications.settings.SettingsConfig },



    ];

    const typeDeselectors = [
      { type: foundry.applications.sheets.ActorSheetV2 },
      { type: foundry.applications.sheets.ItemSheetV2 }
    ];

    if (typeDeselectors.some(entry => app instanceof entry.type)) return;
    if (!typeSelectors.some(entry => app instanceof entry.type)) return;

    wrapContent(element);

  });

  Hooks.on(hooks.preCreateActor, setFlagsOnCharacterPreCreate);
  Hooks.on(hooks.createActor, debugFlagsOnActor);

  //INFO: Character Creation Hooks
  Hooks.on(hooks.preCreateActor, stopDefaultCharacterSheetRenderOnCreation);
  Hooks.on(hooks.createActor, displayCreationDialog);

  //INFO: Fancy Decorations
  Hooks.on(hooks.renderApplicationV2, injectFooterIntoWindowApp);
  Hooks.on(hooks.renderApplicationV2, injectCssSelectors);

  Hooks.once(hooks.init, () => {
    configureProject();
    configureThemes();
    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet },
        { docClass: Actor, type: "storytellerscreen", model: StorytellerScreenModel, sheet: StorytellerScreenActorSheet },
        { docClass: Item, type: "metahuman", model: MetahumanModel, sheet: MetahumanItemSheet },
        { docClass: Item, type: "magic", model: MagicModel, sheet: MagicItemSheet },
        { docClass: Item, type: "weapon", model: WeaponModel, sheet: WeaponItemSheet },
        { docClass: Item, type: "ammunition", model: AmmunitionModel, sheet: AmmunitionItemSheet },
        { docClass: Item, type: "skill", model: SkillModel, sheet: SkillItemSheet },
        { docClass: Item, type: "transaction", model: TransactionModel, sheet: TransactionItemSheet }
      ]
    });
    Log.success("Initialization Completed", "sr3e.js");
  });
}

registerHooks();