import SystemScaleSettingsApp from "../../foundry/applications/SystemScaleSettingsApp";
import { applyRemSize, getRemSize, remSizeSettingKeys, DEFAULT_REM_SIZE_PX } from "./remSizeRuntime";

export function registerRemSizeSettings(): void {
    const settings = game.settings as any;

    settings.register(remSizeSettingKeys.moduleId, remSizeSettingKeys.remSize, {
        name: "REM Size",
        hint: "Base pixel size for 1rem across SR3E UI. Default: 16px.",
        scope: "client",
        config: false,
        type: Number,
        default: DEFAULT_REM_SIZE_PX,
        range: { min: 8, max: 32, step: 1 },
        onChange: (value: number) => applyRemSize(value),
    });

    settings.registerMenu(remSizeSettingKeys.moduleId, "systemScale", {
        name: "System Scale",
        label: "Configure",
        hint: "Set how many pixels one rem represents for SR3E sheets and UI.",
        icon: "fas fa-text-height",
        type: SystemScaleSettingsApp,
    });
}

export function applyRemSizeSetting(): void {
    applyRemSize(getRemSize());
}
