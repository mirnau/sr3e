import StatCardTypeRegistryService from "../services/StatCardTypeRegistryService.js";
import getAddStatCardDialogConfig from "../dialogs/addStatCardDialogConfig.js";
import getConfirmDeleteConfig from "../dialogs/getConfirmDeleteConfig.js";
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

export async function removeStatCard(item, componentId) {
    const component = item.system.components.find(c => c.id === componentId);

    const result = await foundry.applications.api.DialogV2.prompt(getConfirmDeleteConfig(component.name));
    if (!result) return;

    const components = foundry.utils.deepClone(item.system.components ?? []);
    const updated = components.filter(c => c.id !== componentId);

    await item.update({
        "system.components": updated
    });

    ui.notifications.info(`Component "${component.name}" removed.`);
}

export async function moveSheetComponent(item, componentId, direction) {
    const components = foundry.utils.deepClone(item.system.components ?? []);
    const index = components.findIndex(c => c.id === componentId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= components.length) return;

    const temp = components[targetIndex];
    components[targetIndex] = components[index];
    components[index] = temp;

    await item.update({ "system.components": components });
}