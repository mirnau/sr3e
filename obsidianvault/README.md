# SR3E Architecture Documentation

This vault contains architectural documentation for the SR3E Foundry VTT system rewrite.

## Navigation

- [[Current Architecture]] - Analysis of existing codebase
- [[Proposed Architecture]] - Layered architecture design
- [[RollProcedure System]] - Core rules engine design
- [[Rewrite Plan]] - Implementation roadmap

## Key Decisions

1. **Layered Architecture**: UI (Svelte) | Rules (TS) | Foundry Integration
2. **Type Safety**: Proper interfaces and abstract classes, no `Record<string, any>`
3. **Reactivity Strategy**: Writables for inter-component state, runes for local UI state
4. **Testing**: Built alongside implementation, not bolted on

## Mermaid Diagram Support

This vault uses Mermaid for UML diagrams. Ensure Mermaid is enabled in Obsidian settings.
