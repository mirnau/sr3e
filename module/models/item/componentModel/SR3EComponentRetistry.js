export class ComponentRegistry {
  static registry = new Map();

  static register(type, config) {
    this.registry.set(type, config);
  }

  static get(type) {
    return this.registry.get(type);
  }

  static getAll() {
    return Array.from(this.registry.entries()).map(([type, config]) => ({ type, ...config }));
  }
}