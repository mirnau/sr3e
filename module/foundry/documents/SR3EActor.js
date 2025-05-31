export default class SR3EActor extends Actor {
  async canAcceptMetahuman(incomingItem) {
    const existing = this.items.filter(i => i.type === "metahuman");

    if (existing.length > 1) {
      const [oldest, ...rest] = existing.sort((a, b) => a.id.localeCompare(b.id));
      const toDelete = rest.map(i => i.id);
      await this.deleteEmbeddedDocuments("Item", toDelete);
    }

    const current = this.items.find(i => i.type === "metahuman");
    if (!current) return "accept";

    const incomingName = incomingItem.name.toLowerCase();
    const currentName = current.name.toLowerCase();

    const isIncomingHuman = incomingName === "human";
    const isCurrentHuman = currentName === "human";

    if (isCurrentHuman && !isIncomingHuman) return "goblinize";
    if (!isCurrentHuman && isIncomingHuman) return "reject";
    if (incomingName === currentName) return "reject";

    return "reject";
  }

  async replaceMetahuman(newItem) {
    const current = this.items.find(i => i.type === "metahuman");
    if (current) await this.deleteEmbeddedDocuments("Item", [current.id]);

    await this.createEmbeddedDocuments("Item", [newItem.toObject()]);
    await this.update({
      "system.profile.metaHumanity": newItem.name,
      "system.profile.img": newItem.img
    });
  }
}