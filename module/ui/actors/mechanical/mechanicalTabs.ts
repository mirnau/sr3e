export const MECHANICAL_REGISTER_TAB_FLAG = "mechanicalRegisterTab";

export const mechanicalTabs = ["inventory", "upgrades", "journal"] as const;

export type MechanicalTab = (typeof mechanicalTabs)[number];

export function isMechanicalTab(tab: unknown): tab is MechanicalTab {
    return typeof tab === "string" && mechanicalTabs.includes(tab as MechanicalTab);
}
