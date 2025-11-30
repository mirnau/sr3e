export function enforceSingleTechinterfaceEquipped(item, change, options, userId) {
  try {
    if (!item || item.documentName !== "Item") return;
    if (item.type !== "techinterface") return;

    const setFlag = foundry.utils.getProperty(change, "flags.sr3e.isEquipped");
    if (setFlag !== true) return; // only react when being equipped

    const actor = item.parent;
    if (!actor) return;

    const updates = [];
    for (const other of actor.items) {
      if (other.type !== "techinterface") continue;
      if (other.id === item.id) continue;
      const equipped = other.getFlag("sr3e", "isEquipped");
      if (equipped) updates.push({ _id: other.id, "flags.sr3e.isEquipped": false });
    }

    if (updates.length) return actor.updateEmbeddedDocuments("Item", updates, { render: false });
  } catch {}
}

