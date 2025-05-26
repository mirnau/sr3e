import StatCardTypeRegistryService from "../services/StatCardTypeRegistryService.js";
import getAddStatCardDialogConfig from "../dialogs/addStatCardDialogConfig.js";

export function addSheetComponent() {
    console.log("Adding a new sheet component");
}

export function removeSheetComponent() {
    console.log("Removing a sheet component");
}

export async function addStatCard(item, componentId) {

    const config = getAddStatCardDialogConfig(item, componentId);
    const dialog = await foundry.applications.api.DialogV2.wait(config);
}

export function removeStatCard() {
    console.log("Removing a stat card");
}