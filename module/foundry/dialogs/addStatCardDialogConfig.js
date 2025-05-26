import StatCardTypeRegistryService from "../services/StatCardTypeRegistryService.js";

const statTypes = StatCardTypeRegistryService.SheetComponentTypes;

 export default function getAddStatCardDialogConfig(item, componentId) {
  return  {
    window: {
      title: "Add Stat Card"
    },
    content: `
      <form>
        <div class="form-group">
        <label for="stat-name">Stat Name</label>
          <input type="text" name="stat-name" placeholder="e.g. Coolness" />
          </div>
        <div class="form-group">
          <label for="stat-type">Stat Type</label>
          <select name="stat-type">
          ${statTypes.map(t => `<option value="${t.type}">${t.name}</option>`).join("")}
          </select>
          </div>
      </form>
    `,
    buttons: [
      {
        action: "add",
        label: "Add",
        icon: "fa-solid fa-check",
        default: true,
        callback: async (event, button, dialog) => {
          const formData = new FormData(dialog.element.querySelector("form"));
          const name = formData.get("stat-name")?.trim();
          const type = formData.get("stat-type");
          if (!name) return;

          // Get the stat type configuration from the registry
          const statTypeConfig = StatCardTypeRegistryService.SheetComponentTypes.find(t => t.type === type);

          if (!statTypeConfig) {
            console.error("Stat type configuration not found:", type);
            return;
          }

          const newStat = {
            id: foundry.utils.randomID(),
            name,
            type,
            value: statTypeConfig.default,
            options: statTypeConfig.options || [],
            description: "",
            required: false
          };

          // Find the component and add the stat to its SheetComponents array
          const components = foundry.utils.deepClone(item.system.components || []);
          const componentIndex = components.findIndex(c => c.id === componentId);

          if (componentIndex === -1) {
            console.error("Component not found:", componentId);
            return;
          }

          // Initialize SheetComponents array if it doesn't exist
          if (!components[componentIndex].SheetComponents) {
            components[componentIndex].SheetComponents = [];
          }

          components[componentIndex].SheetComponents.push(newStat);
          await item.update({ "system.components": components });
        }
      },
      {
        action: "cancel",
        label: "Cancel",
        icon: "fa-solid fa-xmark"
      }
    ]
  };
}