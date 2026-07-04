const MODULE_ID = "sr3e";
const NEON_NAME_COLOR = "neonNameColor";
const DISABLE_NEON_NAME_BLINKING = "disableNeonNameBlinking";
const DISABLE_NEON_NAME_BLINKING_CLASS = "sr3e-disable-neon-name-blinking";

export const DEFAULT_NEON_NAME_COLOR = "#ff2090";
export const NEON_NAME_COLOR_VAR = "--neon-name-color";

export type SheetColorKey =
    | "highlightPrimary"
    | "highlightSecondary"
    | "highlightTertiary"
    | "sheetShadowStart"
    | "sheetShadowMiddle"
    | "sheetShadowEnd"
    | "neonName";

export type SheetColorDefinition = {
    key: SheetColorKey;
    setting: string;
    label: string;
    hint: string;
    cssVar: string;
    defaultColor: string;
};

export const sheetColorDefinitions: SheetColorDefinition[] = [
    {
        key: "highlightPrimary",
        setting: "highlightPrimaryColor",
        label: "Primary",
        hint: "Main neon highlight used by buttons, frames, text, and icons.",
        cssVar: "--highlight-color-primary",
        defaultColor: "#41e9ca",
    },
    {
        key: "highlightSecondary",
        setting: "highlightSecondaryColor",
        label: "Secondary",
        hint: "Secondary highlight used by labels and supporting headings.",
        cssVar: "--highlight-color-secondary",
        defaultColor: "#27c0a1",
    },
    {
        key: "highlightTertiary",
        setting: "highlightTertiaryColor",
        label: "Tertiary",
        hint: "Tertiary highlight used by major headings and selected accents.",
        cssVar: "--highlight-color-tertiary",
        defaultColor: "#1cd8b9",
    },
    {
        key: "sheetShadowStart",
        setting: "sheetShadowStartColor",
        label: "Sheet Glow Start",
        hint: "First color in the blurred rotating sheet-card background.",
        cssVar: "--sheet-shadow-start-color",
        defaultColor: "#00ffea",
    },
    {
        key: "sheetShadowMiddle",
        setting: "sheetShadowMiddleColor",
        label: "Sheet Glow Middle",
        hint: "Middle color in the blurred rotating sheet-card background.",
        cssVar: "--sheet-shadow-middle-color",
        defaultColor: "#ff229c",
    },
    {
        key: "sheetShadowEnd",
        setting: "sheetShadowEndColor",
        label: "Sheet Glow End",
        hint: "Final color in the blurred rotating sheet-card background.",
        cssVar: "--sheet-shadow-end-color",
        defaultColor: "#00ffea",
    },
    {
        key: "neonName",
        setting: NEON_NAME_COLOR,
        label: "Neon Name Color",
        hint: "Color used for the glowing character name on character sheets.",
        cssVar: NEON_NAME_COLOR_VAR,
        defaultColor: DEFAULT_NEON_NAME_COLOR,
    },
];

export function normalizeHexColor(value: unknown): string {
    const color = String(value ?? "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : DEFAULT_NEON_NAME_COLOR;
}

export function getSheetColor(definition: SheetColorDefinition): string {
    return normalizeHexColorWithDefault((game.settings as any).get(MODULE_ID, definition.setting), definition.defaultColor);
}

export async function setSheetColor(definition: SheetColorDefinition, color: string): Promise<void> {
    await (game.settings as any).set(MODULE_ID, definition.setting, normalizeHexColorWithDefault(color, definition.defaultColor));
}

export async function resetSheetColor(definition: SheetColorDefinition): Promise<void> {
    await setSheetColor(definition, definition.defaultColor);
}

export function applySheetColor(definition: SheetColorDefinition, color: string): void {
    document.documentElement.style.setProperty(definition.cssVar, normalizeHexColorWithDefault(color, definition.defaultColor));
}

export function disableNeonNameBlinkingSetting(): boolean {
    return Boolean((game.settings as any).get(MODULE_ID, DISABLE_NEON_NAME_BLINKING));
}

export async function setDisableNeonNameBlinking(disabled: boolean): Promise<void> {
    await (game.settings as any).set(MODULE_ID, DISABLE_NEON_NAME_BLINKING, Boolean(disabled));
}

export function applyDisableNeonNameBlinking(disabled: boolean): void {
    document.documentElement.classList.toggle(DISABLE_NEON_NAME_BLINKING_CLASS, Boolean(disabled));
}

export const sheetColorSettingKeys = {
    moduleId: MODULE_ID,
    neonNameColor: NEON_NAME_COLOR,
    disableNeonNameBlinking: DISABLE_NEON_NAME_BLINKING,
} as const;

function normalizeHexColorWithDefault(value: unknown, defaultColor: string): string {
    const color = String(value ?? "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : defaultColor;
}
