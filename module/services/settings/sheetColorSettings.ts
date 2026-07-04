import SheetColorSettingsApp from "../../foundry/applications/SheetColorSettingsApp";
import {
    applySheetColor,
    getSheetColor,
    sheetColorDefinitions,
    sheetColorSettingKeys,
} from "./sheetColorRuntime";

export function registerSheetColorSettings(): void {
    const settings = game.settings as any;
    for (const definition of sheetColorDefinitions) {
        settings.register(sheetColorSettingKeys.moduleId, definition.setting, {
            name: definition.label,
            hint: definition.hint,
            scope: "world",
            config: false,
            type: String,
            default: definition.defaultColor,
            onChange: (color: string) => applySheetColor(definition, color),
        });
    }

    settings.registerMenu(sheetColorSettingKeys.moduleId, "sheetColors", {
        name: "Sheet Colors",
        label: "Configure",
        hint: "Adjust selected SR3E sheet colors without changing layout or typography.",
        icon: "fas fa-palette",
        type: SheetColorSettingsApp,
        restricted: true,
    });
}

export function applySheetColorSettings(): void {
    for (const definition of sheetColorDefinitions) {
        applySheetColor(definition, getSheetColor(definition));
    }
}
