import StatCardTypeRegistryService from "../services/StatCardTypeRegistryService.js";

const statTypes = StatCardTypeRegistryService.SheetComponentTypes;

export default function getAddStatCardDialogConfig(item, componentId) {
  return {
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
          <select name="stat-type" id="stat-type-select">
            ${statTypes.map(t => `<option value="${t.type}" data-name="${t.name}">${t.name}</option>`).join("")}
          </select>
        </div>
        
        <!-- Currency-specific fields (initially hidden) -->
        <div id="currency-fields" class="form-group" style="display: none;">
          <div class="form-group">
            <label for="currency-value">Initial Value</label>
            <input type="number" name="currency-value" placeholder="0" step="0.01" />
          </div>
          <div class="form-group">
            <label for="currency-symbol">Currency Symbol</label>
            <input type="text" name="currency-symbol" placeholder="¥" maxlength="3" />
          </div>
          <div class="form-group">
            <label for="exchange-rate">Nuyen Exchange Rate</label>
            <input type="number" name="exchange-rate" placeholder="1" step="0.01" min="0" />
          </div>
        </div>
      </form>
    `,
    render: (event, dialog) => {
      // This runs after the dialog is rendered
      const statTypeSelect = dialog.element.querySelector('#stat-type-select');
      const currencyFields = dialog.element.querySelector('#currency-fields');
      const statNameInput = dialog.element.querySelector('input[name="stat-name"]');
      const addButton = dialog.element.querySelector('[data-action="add"]');
      
      function toggleCurrencyFields() {
        const selectedOption = statTypeSelect.selectedOptions[0];
        const selectedName = selectedOption.getAttribute('data-name');
        
        if (selectedName === 'Currency') {
          currencyFields.style.display = 'block';
          // Set default values
          const valueInput = currencyFields.querySelector('input[name="currency-value"]');
          const symbolInput = currencyFields.querySelector('input[name="currency-symbol"]');
          const exchangeInput = currencyFields.querySelector('input[name="exchange-rate"]');
          
          if (!valueInput.value) valueInput.value = '0';
          if (!symbolInput.value) symbolInput.value = '¥';
          if (!exchangeInput.value) exchangeInput.value = '1';
        } else {
          currencyFields.style.display = 'none';
        }
      }
      
      function toggleAddButton() {
        const statName = statNameInput.value.trim();
        if (statName) {
          addButton.disabled = false;
          addButton.style.opacity = '1';
        } else {
          addButton.disabled = true;
          addButton.style.opacity = '0.5';
        }
      }
      
      // Initial checks
      toggleCurrencyFields();
      toggleAddButton();
      
      // Listen for changes
      statTypeSelect.addEventListener('change', toggleCurrencyFields);
      statNameInput.addEventListener('input', toggleAddButton);
      statNameInput.addEventListener('keyup', toggleAddButton);
    },
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
          
          if (!name) {
            ui.notifications.warn("Please enter a stat name.");
            return;
          }

          // Get the selected option to determine the actual stat type name
          const selectElement = dialog.element.querySelector("#stat-type-select");
          const selectedOption = selectElement.selectedOptions[0];
          const selectedName = selectedOption.getAttribute('data-name');

          // Find the stat type configuration from the registry
          const statTypeConfig = StatCardTypeRegistryService.SheetComponentTypes.find(t => 
            t.type === type && t.name === selectedName
          );

          if (!statTypeConfig) {
            console.error("Stat type configuration not found:", type, selectedName);
            ui.notifications.error("Invalid stat type selected.");
            return;
          }

          const newStat = {
            id: foundry.utils.randomID(),
            name,
            type,
            typeName: selectedName, // Store the specific type name
            value: JSON.stringify(statTypeConfig.default),
            options: statTypeConfig.options || [],
            description: "",
            required: false
          };

          // Add currency-specific properties if this is a currency type
          if (selectedName === 'Currency') {
            const currencyValue = parseFloat(formData.get("currency-value")) || 0;
            const currencySymbol = formData.get("currency-symbol")?.trim() || statTypeConfig.defaultSymbol || '¥';
            const exchangeRate = parseFloat(formData.get("exchange-rate")) || statTypeConfig.nuyenExchangeRate || 1;
            
            // Override the default value with the user-specified currency value
            newStat.value = JSON.stringify(currencyValue);
            newStat.currencySymbol = currencySymbol;
            newStat.nuyenExchangeRate = exchangeRate;
          }

          // Find the component and add the stat to its SheetComponents array
          const components = foundry.utils.deepClone(item.system.components || []);
          const componentIndex = components.findIndex(c => c.id === componentId);

          if (componentIndex === -1) {
            console.error("Component not found:", componentId);
            ui.notifications.error("Component not found.");
            return;
          }

          // Initialize SheetComponents array if it doesn't exist
          if (!components[componentIndex].SheetComponents) {
            components[componentIndex].SheetComponents = [];
          }

          components[componentIndex].SheetComponents.push(newStat);
          
          try {
            await item.update({ "system.components": components });
            ui.notifications.info(`Added stat: ${name}`);
          } catch (error) {
            console.error("Failed to update item:", error);
            ui.notifications.error("Failed to add stat.");
          }
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