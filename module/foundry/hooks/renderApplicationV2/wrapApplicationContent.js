export function wrapApplicationContent(app, element) {
   if (!element || element.firstElementChild?.classList.contains("sheet-component")) return;

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
      { type: foundry.applications.sheets.ItemSheetV2 },
   ];

   if (typeDeselectors.some((entry) => app instanceof entry.type)) return;
   if (!typeSelectors.some((entry) => app instanceof entry.type)) return;

   wrapContent(element);
}

export function wrapContent(root) {
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

   innerBackground.append(...existing);
   innerContainer.append(fakeShadow, innerBackground);
   sheetComponent.append(innerContainer);

   root.appendChild(sheetComponent);
}
