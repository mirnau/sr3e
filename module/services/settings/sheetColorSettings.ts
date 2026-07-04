import SheetColorSettingsApp from "../../foundry/applications/SheetColorSettingsApp";
import {
    applySheetColor,
    applyDisableNeonNameBlinking,
    disableNeonNameBlinkingSetting,
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

    settings.register(sheetColorSettingKeys.moduleId, sheetColorSettingKeys.disableNeonNameBlinking, {
        name: "Disable Neon Name Blinking",
        hint: "Stops the glow and flicker animation on character sheet neon names.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        restricted: true,
        onChange: (disabled: boolean) => applyDisableNeonNameBlinking(disabled),
    });

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
    applyDisableNeonNameBlinking(disableNeonNameBlinkingSetting());
}
