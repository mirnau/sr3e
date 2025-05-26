// Component Templates for quick creation
class ComponentTemplates {
  static templates = {
    commodity: {
      name: "Commodity",
      SheetComponents: [
        { name: "Price", type: "number", value: 0 },
        { name: "Legality", type: "text", value: "Legal" },
        { name: "Availability", type: "select", options: ["Common", "Uncommon", "Rare", "Restricted"] }
      ]
    },
    weapon: {
      name: "Weapon Stats",
      SheetComponents: [
        { name: "Damage", type: "text", value: "6M" },
        { name: "Reach", type: "number", value: 0 },
        { name: "Concealability", type: "number", value: 4 },
        { name: "Weight", type: "number", value: 1 }
      ]
    },
    physical: {
      name: "Physical Traits",
      SheetComponents: [
        { name: "Height", type: "number", value: 180 },
        { name: "Weight", type: "number", value: 70 },
        { name: "Age", type: "number", value: 25 }
      ]
    },
    magic: {
      name: "Magical Properties",
      SheetComponents: [
        { name: "Force", type: "number", value: 1 },
        { name: "Drain", type: "text", value: "L" },
        { name: "Type", type: "select", options: ["Spell", "Focus", "Formula", "Spirit"] }
      ]
    }
  };

  static getAll() {
    return Object.entries(this.templates).map(([key, template]) => ({
      id: key,
      ...template
    }));
  }

  static create(templateId) {
    const template = this.templates[templateId];
    if (!template) return null;

    return {
      id: foundry.utils.randomID(),
      name: template.name,
      type: "custom",
      collapsed: false,
      SheetComponents: template.SheetComponents.map(card => ({
        id: foundry.utils.randomID(),
        ...card,
        options: card.options || [],
        description: "",
        required: false
      })),
      position: { x: 0, y: 0 }
    };
  }
}