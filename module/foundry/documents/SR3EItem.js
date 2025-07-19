export class SR3EItem extends Item {
  prepareEmbeddedDocuments() {
    this.items = new foundry.abstract.EmbeddedCollection("Item", [], this);
  }

  get items() {
    if (!this._items) {
      this._items = new foundry.abstract.EmbeddedCollection("Item", [], this);
    }
    return this._items;
  }
}
